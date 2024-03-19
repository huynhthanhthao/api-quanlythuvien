const { Op } = require("sequelize");
const db = require("../models");
const unidecode = require("unidecode");
const { bulkUpdate, getPagination } = require("../../utils/customer-sequelize");
const ReaderGroupService = require("./readerGroup.service");
const { CatchException } = require("../../utils/api-error");
const BookService = require("./book.service");
const ActivityService = require("./activityLog.service");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");
const { LOAN_STATUS, DEFAULT_LIMIT, ACTIVITY_TYPE } = require("../../enums/common");
const {
    calculateDaysDiff,
    convertToIntArray,
    getEndOfDay,
    fDate,
    getStartOfDay,
    convertDate,
} = require("../../utils/server");
const { mapResponseLoanReceiptList, mapResponseLoanReceiptItem } = require("../map-responses/loanReceipt.map-response");
const PenaltyTicketService = require("./penaltyTicket.service");
const SettingService = require("./setting.service");

class LoanReceiptService {
    static async createLoanReceipt(newLoanReceipt, account) {
        if (newLoanReceipt.books?.length <= 0)
            throw new CatchException("Phải có ít nhất 1 quyển sách.", errorCodes.MISSING_DATA, {
                field: "books",
            });

        // check time and limit borrow
        await this.checkBorrowLimitExceeded(
            newLoanReceipt.returnDate,
            newLoanReceipt.books?.length,
            newLoanReceipt.userId,
            account
        );

        // check quantity in stock
        await this.checkBooksInStock(newLoanReceipt.books, "", account);

        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            const receiptCode = await this.generateReceiptCode(account.schoolId);

            const loanReceipt = await db.LoanReceipt.create(
                {
                    ...newLoanReceipt,
                    receiptCode,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { transaction }
            );

            const receiptBookData = newLoanReceipt?.books.map((book) => ({
                bookId: book.id,
                bookStatusId: book.statusId,
                loanFee: book.loanFee,
                loanReceiptId: loanReceipt.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            await db.ReceiptHasBook.bulkCreate(receiptBookData, { transaction });

            await ActivityService.createActivity(
                { dataTarget: loanReceipt.id, tableTarget: TABLE_NAME.LOAN_RECEIPT, action: ACTIVITY_TYPE.CREATED },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async checkBorrowLimitExceeded(returnDate, newQuantity, userId, account) {
        const borrowCount = await db.ReceiptHasBook.count({
            where: {
                type: LOAN_STATUS.BORROWING,
                active: true,
                schoolId: account.schoolId,
            },
            include: [
                {
                    model: db.LoanReceipt,
                    as: "loanReceipt",
                    where: { active: true, schoolId: account.id, userId: userId },
                    required: true,
                },
            ],
        });

        const borrowLimit = await ReaderGroupService.getBorrowLimit(userId, account);

        if (borrowCount + newQuantity > borrowLimit?.quantityLimit) {
            throw new CatchException("Vượt quá số lượng cho phép mượn.", errorCodes.BORROW_LIMIT, {
                field: "books",
            });
        }

        if (calculateDaysDiff(returnDate) + 1 > borrowLimit.timeLimit)
            throw new CatchException("Vượt quá thời gian cho phép mượn.", errorCodes.BORROW_LIMIT, {
                field: "returnDate",
            });
    }

    static async checkBooksInStock(books, loanReceiptId, account) {
        const bookIds = books.map((book) => book.id);
        const booksOutOfStock = [];
        const bookList = await BookService.getQuantityByBookIds(bookIds, loanReceiptId, account.schoolId);
        for (const book of bookList) {
            if (book.maxQuantity <= book.amountBorrowed) {
                booksOutOfStock.push(book.id);
            }
        }

        if (booksOutOfStock.length > 0)
            throw new CatchException("Sách đã hết trong kho.", errorCodes.INVALID_DATA, {
                field: "books",
                books: booksOutOfStock,
            });
    }

    static async updateLoanReceiptById(loanReceiptUpdate, account) {
        if (loanReceiptUpdate.books?.length <= 0)
            throw new CatchException("Phải có ít nhất 1 quyển sách.", errorCodes.MISSING_DATA, {
                field: "books",
            });

        await this.checkBorrowLimitExceeded(
            loanReceiptUpdate.returnDate,
            loanReceiptUpdate.books?.length,
            loanReceiptUpdate.userId,
            account
        );

        // check quantity in stock
        await this.checkBooksInStock(loanReceiptUpdate.books, loanReceiptUpdate.id, account);

        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            await db.LoanReceipt.update(
                {
                    returnDate: loanReceiptUpdate.returnDate,
                    totalFee: loanReceiptUpdate.totalFee,
                    receiptDes: loanReceiptUpdate.receiptDes,
                    userId: loanReceiptUpdate.userId,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { where: { id: loanReceiptUpdate.id, active: true, schoolId: account.schoolId }, transaction }
            );
            const receiptBookData = loanReceiptUpdate?.books.map((book) => ({
                bookId: book.id,
                bookStatusId: book.statusId,
                loanFee: book.loanFee,
                loanReceiptId: loanReceiptUpdate.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            await bulkUpdate(
                receiptBookData,
                db.ReceiptHasBook,
                { loanReceiptId: loanReceiptUpdate.id, schoolId: account.schoolId },
                account,
                transaction
            );

            await ActivityService.createActivity(
                {
                    dataTarget: loanReceiptUpdate.id,
                    tableTarget: TABLE_NAME.LOAN_RECEIPT,
                    action: ACTIVITY_TYPE.UPDATED,
                },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getLoanReceipts(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const { from, to, readerCode } = query;
        const types = query.types ? convertToIntArray(query.types) : [];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableFields = ["receiptCode", "receiptDes"];

        const whereLoanReceiptCondition = {
            [Op.and]: [
                keyword && {
                    [Op.or]: [
                        ...searchableFields.map((field) =>
                            db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                                [Op.iLike]: `%${unidecode(keyword)}%`,
                            })
                        ),
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col("user.fullName")), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        }),
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col("user.readerCode")), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        }),
                    ],
                },
                { active: true },
                { schoolId: account.schoolId },
                from && { receiveDate: { [Op.gte]: getStartOfDay(convertDate(from)) } },
                to && { receiveDate: { [Op.lte]: getEndOfDay(convertDate(to)) } },
                types &&
                    types.includes(LOAN_STATUS.BORROWING) && { returnDate: { [Op.lt]: getStartOfDay(new Date()) } },
            ].filter(Boolean),
        };

        const whereUserCondition = {
            ...(readerCode && { readerCode: readerCode.toUpperCase() }),
            active: true,
            schoolId: account.schoolId,
        };

        const whereReceiptHasBookCondition = {
            ...(types.length > 0 && { type: { [Op.in]: types } }),
            active: true,
            schoolId: account.schoolId,
        };

        const whereCommonCondition = { active: true, schoolId: account.schoolId };

        const { rows, count } = await db.LoanReceipt.findAndCountAll({
            where: whereLoanReceiptCondition,
            attributes: ["id", "userId", "receiptCode", "receiveDate", "returnDate", "createdAt", "totalFee"],
            include: [
                {
                    model: db.User,
                    as: "user",
                    where: whereUserCondition,
                    required: keyword || readerCode ? true : false,
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                    },
                },
                {
                    model: db.BookLostReport,
                    as: "bookLostReport",
                    where: whereCommonCondition,
                    required: false,
                    attributes: ["loanReceiptId"],
                    include: [
                        {
                            model: db.LostReportHasBook,
                            as: "lostReportHasBook",
                            where: whereCommonCondition,
                            required: false,
                            attributes: ["bookId"],
                        },
                    ],
                },
                {
                    model: db.ReceiptHasBook,
                    as: "receiptHasBook",
                    where: whereReceiptHasBookCondition,
                    required: types.length > 0 ? true : false,
                    attributes: {
                        exclude: ["createdBy", "updatedBy", "active", "schoolId"],
                    },
                    include: [
                        {
                            model: db.Book,
                            as: "book",
                            where: whereCommonCondition,
                            required: false,
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                            },
                        },
                        {
                            model: db.BookStatus,
                            as: "bookStatus",
                            where: whereCommonCondition,
                            required: false,
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                            },
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: mapResponseLoanReceiptList(rows),
        };
    }

    static async getLoanReceiptByIdOrCode(keyword, account) {
        const whereLoanReceiptCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (isNaN(keyword)) {
            whereLoanReceiptCondition.receiptCode = keyword?.toUpperCase();
        } else {
            whereLoanReceiptCondition.id = Number(keyword);
        }

        const loanReceipt = await db.LoanReceipt.findOne({
            where: whereLoanReceiptCondition,
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.User,
                    as: "user",
                    where: whereCondition,
                    required: false,
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                    },
                },
                {
                    model: db.ReceiptHasBook,
                    as: "receiptHasBook",
                    where: whereCondition,
                    required: false,
                    attributes: {
                        exclude: ["createdBy", "updatedBy", "active", "schoolId"],
                    },
                    include: [
                        {
                            model: db.Book,
                            as: "book",
                            where: whereCondition,
                            required: false,
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                            },
                        },
                        {
                            model: db.BookStatus,
                            as: "bookStatus",
                            where: whereCondition,
                            required: false,
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                            },
                        },
                    ],
                },
            ],
        });

        return mapResponseLoanReceiptItem(loanReceipt);
    }

    static async giveBooksBack(loanReceipt, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const bookIds = loanReceipt.bookIds || [];
            const whereCondition = { active: true, schoolId: account.schoolId };

            const borrowBooks = await db.Book.findAll({
                where: { ...whereCondition, id: { [Op.in]: bookIds } },
                attributes: ["id"],
                include: [
                    {
                        model: db.ReceiptHasBook,
                        as: "receiptHasBook",
                        where: { ...whereCondition },
                        required: true,
                        attributes: {
                            exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                        },
                        include: [
                            {
                                model: db.LoanReceipt,
                                as: "loanReceipt",
                                where: { ...whereCondition, userId: loanReceipt.userId },
                                required: true,
                                attributes: ["id", "returnDate"],
                            },
                        ],
                    },
                ],
            });

            if (borrowBooks.length != bookIds.length) {
                const borrowBookIds = borrowBooks.map((book) => +book.id);
                throw new CatchException(
                    "Sách mượn không phải của bạn đọc này!",
                    errorCodes.BOOK_NOT_BELONG_TO_READER,
                    {
                        field: "bookIds",
                        unBorrowedBookIds: bookIds.filter((bookId) => !borrowBookIds.includes(bookId)),
                    }
                );
            }

            let unpaidBooks = [];
            let returnedBooks = [];

            borrowBooks.forEach((item) => {
                let hasUnpaidBook = item.receiptHasBook.some((book) => book.type === LOAN_STATUS.BORROWING);
                if (hasUnpaidBook) {
                    unpaidBooks.push(item);
                } else {
                    returnedBooks.push(item);
                }
            });

            if (returnedBooks.length > 0)
                throw new CatchException("Sách này đã trả rồi!", errorCodes.BOOK_RETURNED, {
                    field: "bookIds",
                    returnedBookIds: returnedBooks.map((book) => book.id),
                });

            const overdueBooks = unpaidBooks.flatMap((book) =>
                book?.receiptHasBook
                    .filter(
                        (receiptBook) => fDate(new Date()) > fDate(getEndOfDay(receiptBook?.loanReceipt?.returnDate))
                    )
                    .map((receiptBook) => ({
                        id: book.id,
                        returnDate: receiptBook?.loanReceipt?.returnDate,
                    }))
            );

            await db.ReceiptHasBook.update(
                { type: LOAN_STATUS.PAID, updatedBy: account.id },
                {
                    where: { ...whereCondition, bookId: { [Op.in]: bookIds } },
                    transaction,
                }
            );

            const setting = await SettingService.getSettingBySchoolId(account);

            if (setting?.hasFineFee && overdueBooks.length > 0) {
                const penaltyTicketId = await PenaltyTicketService.createPenaltyTicket(
                    loanReceipt.userId,
                    overdueBooks,
                    account,
                    transaction
                );

                await ActivityService.createActivity(
                    {
                        dataTarget: JSON.stringify(bookIds),
                        tableTarget: TABLE_NAME.LOAN_RECEIPT,
                        action: ACTIVITY_TYPE.GIVE_BOOK_BACK,
                    },
                    account,
                    transaction
                );

                await transaction.commit();
                return { code: errorCodes.BOOKS_ARE_LATE, penaltyTicketId, overdueBooks };
            }

            await ActivityService.createActivity(
                {
                    dataTarget: JSON.stringify(bookIds),
                    tableTarget: TABLE_NAME.LOAN_RECEIPT,
                    action: ACTIVITY_TYPE.GIVE_BOOK_BACK,
                },
                account,
                transaction
            );

            await transaction.commit();
            return overdueBooks.length > 0 ? { code: errorCodes.BOOKS_ARE_LATE, overdueBooks } : null;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async generateReceiptCode(schoolId) {
        const { dataValues: highestBook } = (await db.LoanReceipt.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("receiptCode")), "maxReceiptCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newReceiptCode = "PM00001";

        if (highestBook && highestBook?.maxReceiptCode) {
            const currentNumber = parseInt(highestBook.maxReceiptCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newReceiptCode = `PM${nextNumber.toString().padStart(5, "0")}`;
        }

        return newReceiptCode;
    }

    static async deleteLoanReceiptByIds(ids, account) {
        await db.LoanReceipt.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, active: true, schoolId: account.schoolId } }
        );

        await db.ReceiptHasBook.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { loanReceiptId: { [Op.in]: ids }, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(ids),
                tableTarget: TABLE_NAME.LOAN_RECEIPT,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );
    }
}

module.exports = LoanReceiptService;
