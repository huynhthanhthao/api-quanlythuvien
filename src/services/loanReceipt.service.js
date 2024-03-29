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
const { LOAN_STATUS, DEFAULT_LIMIT, ACTIVITY_TYPE, QUERY_ONE_TYPE } = require("../../enums/common");
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
const UserService = require("./user.service");

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
        await this.checkBooksInStock(newLoanReceipt.books, account);

        // check out the pre-ordered books
        const bookingBook = await this.findBookingBooks(newLoanReceipt, account);

        this.validateBookingBooks(bookingBook);

        // check reader validity
        await UserService.checkUserValidity(newLoanReceipt.userId, account, "userId");

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
                    where: { active: true, schoolId: account.schoolId, userId: userId },
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

    static async checkBooksInStock(books, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const bookIds = books.map((book) => book.id);
        const booksOutOfStock = [];
        for (const bookId of bookIds) {
            const bookBorrowed = await db.ReceiptHasBook.findOne({
                where: { ...whereCondition, bookId: bookId, type: LOAN_STATUS.BORROWING },
                attributes: ["id"],
            });

            if (bookBorrowed) booksOutOfStock.push(bookId);
        }

        if (booksOutOfStock.length > 0)
            throw new CatchException("Sách đã hết trong kho.", errorCodes.BOOK_OUT_OF_STOCK, {
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
        await this.checkBooksInStock(loanReceiptUpdate.books, account);

        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            await db.LoanReceipt.update(
                {
                    returnDate: loanReceiptUpdate.returnDate,
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
            attributes: ["id", "userId", "receiptCode", "receiveDate", "returnDate", "createdAt"],
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
                            attributes: ["id", "bookCode"],
                            include: [
                                {
                                    model: db.BookStatus,
                                    as: "status",
                                    where: whereCommonCondition,
                                    required: false,
                                    attributes: ["statusName"],
                                },
                                {
                                    model: db.BookGroup,
                                    as: "bookGroup",
                                    where: whereCommonCondition,
                                    required: false,
                                    attributes: ["bookName", "photoURL"],
                                },
                            ],
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

    static async getLoanReceiptByIdOrCode(query, account) {
        const { keyword } = query;
        const type = query.type || QUERY_ONE_TYPE.ID;

        const whereLoanReceiptCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (type == QUERY_ONE_TYPE.CODE) {
            whereLoanReceiptCondition.receiptCode = { [Op.iLike]: keyword };
        } else {
            whereLoanReceiptCondition.id = keyword;
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
                            include: [
                                {
                                    model: db.BookStatus,
                                    as: "status",
                                    where: whereCondition,
                                    required: false,
                                    attributes: {
                                        exclude: [
                                            "createdAt",
                                            "updatedAt",
                                            "createdBy",
                                            "updatedBy",
                                            "active",
                                            "schoolId",
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!loanReceipt) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseLoanReceiptItem(loanReceipt);
    }

    static async giveBooksBack(loanReceipt, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const borrowBooks = await this.findBorrowedBooks(loanReceipt, account);

            this.validateBorrowedBooks(borrowBooks, loanReceipt.books);

            const { unpaidBooks, returnedBooks } = this.separateBooksByPaymentStatus(borrowBooks);

            this.checkReturnedBooks(returnedBooks);

            const overdueBooks = this.findOverdueBooks(unpaidBooks);

            await this.updateBookReceipts(loanReceipt, borrowBooks, account, transaction);

            const resultHasPenaltyTicket = await this.createActivityAndPenaltyTicket(
                overdueBooks,
                loanReceipt,
                account,
                transaction
            );

            if (resultHasPenaltyTicket) {
                await transaction.commit();
                return resultHasPenaltyTicket;
            }

            await transaction.commit();

            return this.handleOverdueBooks(overdueBooks, account);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async findBorrowedBooks(loanReceipt, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        return await db.Book.findAll({
            where: { ...whereCondition, id: { [Op.in]: loanReceipt.books.map((book) => book.id) } },
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
    }

    static async findBookingBooks(loanReceipt, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const bookIds = loanReceipt.books.map((book) => book.id);
        return await db.Book.findAll({
            where: { ...whereCondition, id: { [Op.in]: bookIds } },
            attributes: ["id"],
            include: [
                {
                    model: db.BookingHasBook,
                    as: "bookingHasBook",
                    where: whereCondition,
                    required: true,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.BookingBorrowForm,
                            as: "bookingForm",
                            where: { ...whereCondition, isConfirmed: true },
                            required: true,
                            attributes: ["id"],
                        },
                    ],
                },
            ],
        });
    }

    static validateBorrowedBooks(borrowBooks, requestedBooks) {
        if (borrowBooks.length !== requestedBooks.length) {
            const borrowBookIds = borrowBooks.map((book) => +book.id);

            const bookNotBorrow = requestedBooks.filter((book) => !borrowBookIds.includes(+book.id));

            throw new CatchException("Sách mượn không phải của bạn đọc này!", errorCodes.BOOK_NOT_BELONG_TO_READER, {
                field: "bookIds",
                unBorrowedBookIds: bookNotBorrow.map((book) => book.id),
            });
        }
    }

    static validateBookingBooks(bookingBooks) {
        if (bookingBooks.length > 0) {
            const bookingBookIds = bookingBooks.map((book) => +book.id);

            throw new CatchException("Sách này đã được đặt trước đó!", errorCodes.RESOURCE_NOT_AVAILABLE, {
                field: "bookIds",
                bookingBookIds,
            });
        }
    }

    static separateBooksByPaymentStatus(borrowBooks) {
        const unpaidBooks = [];
        const returnedBooks = [];

        borrowBooks.forEach((item) => {
            const hasUnpaidBook = item.receiptHasBook.some((book) => book.type === LOAN_STATUS.BORROWING);
            hasUnpaidBook ? unpaidBooks.push(item) : returnedBooks.push(item);
        });

        return { unpaidBooks, returnedBooks };
    }

    static checkReturnedBooks(returnedBooks) {
        if (returnedBooks.length > 0) {
            throw new CatchException("Sách này đã trả rồi!", errorCodes.BOOK_RETURNED, {
                field: "bookIds",
                returnedBookIds: returnedBooks.map((book) => book.id),
            });
        }
    }

    static findOverdueBooks(unpaidBooks) {
        return unpaidBooks.flatMap((book) =>
            book.receiptHasBook
                .filter((receiptBook) => fDate(new Date()) > fDate(getEndOfDay(receiptBook.loanReceipt.returnDate)))
                .map((receiptBook) => ({
                    id: book.id,
                    returnDate: receiptBook.loanReceipt.returnDate,
                }))
        );
    }

    static async updateBookReceipts(loanReceipt, borrowBooks, account, transaction) {
        const borrowBookIds = borrowBooks.map((book) => +book.id);

        const whereCondition = { active: true, schoolId: account.schoolId };
        const receiptBookBeforeBorrow = await db.ReceiptHasBook.findAll({
            where: { ...whereCondition, bookId: { [Op.in]: borrowBookIds }, type: LOAN_STATUS.BORROWING },
            include: [
                {
                    model: db.LoanReceipt,
                    as: "loanReceipt",
                    where: { active: true, schoolId: account.schoolId, userId: loanReceipt.userId },
                    required: false,
                    attributes: ["id"],
                },
            ],
        });

        const updateOperations = receiptBookBeforeBorrow.map(async (receiptBook) => {
            receiptBook.type = LOAN_STATUS.PAID;
            receiptBook.bookStatusId = loanReceipt.books.find((book) => book.id == receiptBook.bookId).bookStatusId;
            await receiptBook.save({ transaction });
        });

        await Promise.all(updateOperations);
    }

    static async createActivityAndPenaltyTicket(overdueBooks, loanReceipt, account, transaction) {
        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(loanReceipt.books.map((book) => book.id)),
                tableTarget: TABLE_NAME.LOAN_RECEIPT,
                action: ACTIVITY_TYPE.GIVE_BOOK_BACK,
            },
            account,
            transaction
        );

        if (overdueBooks.length > 0) {
            const setting = await SettingService.getSettingBySchoolId(account);

            if (setting?.hasFineFee) {
                const penaltyTicketId = await PenaltyTicketService.createPenaltyTicket(
                    loanReceipt.userId,
                    overdueBooks,
                    setting,
                    account,
                    transaction
                );
                return { code: errorCodes.BOOKS_ARE_LATE, penaltyTicketId, overdueBooks };
            }
        }
        return;
    }

    static handleOverdueBooks(overdueBooks, account) {
        return overdueBooks.length > 0 ? { code: errorCodes.BOOKS_ARE_LATE, overdueBooks } : null;
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
