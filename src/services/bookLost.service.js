const { Op } = require("sequelize");
const db = require("../models");
const unidecode = require("unidecode");
const { CatchException } = require("../../utils/api-error");
const { bulkUpdate, getPagination } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { errorCodes } = require("../../enums/error-code");
const { mapResponseBookLostList, mapResponseBookLostItem } = require("../map-responses/bookLost.map-response");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE, LOAN_STATUS, API_ACTION } = require("../../enums/common");
const { TABLE_NAME } = require("../../enums/languages");

class BookLostService {
    static async checkBooksInLoanReceipt(bookIds, loanReceiptId, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const countBookInLoanReceipt = await db.ReceiptHasBook.count({
            where: { ...whereCondition, bookId: { [Op.in]: bookIds }, loanReceiptId },
        });

        if (countBookInLoanReceipt < bookIds.length) {
            throw new CatchException("Sách không nằm trong phiếu mượn!", errorCodes.INVALID_DATA, {
                field: "bookIds",
            });
        }
    }

    static async checkBookLostReported(bookIds, loanReceiptId, account) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
            bookId: { [Op.in]: bookIds },
        };

        const bookLostReported = await db.LostReportHasBook.findAll({
            where: whereCondition,
            attributes: ["bookId"],
            include: [
                {
                    model: db.BookLostReport,
                    as: "lostReport",
                    where: { active: true, schoolId: account.schoolId, loanReceiptId },
                    required: true,
                    attributes: ["id"],
                },
            ],
        });

        if (bookLostReported.length > 0) {
            throw new CatchException("Sách đã báo mất rồi!", errorCodes.INVALID_DATA, {
                field: "bookIds",
                bookIds: bookLostReported.map((item) => item.bookId),
            });
        }
    }

    static async createBookLost(newBookLost, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const bookIds = newBookLost.bookIds || [];

        // Kiểm tra sách có trong phiếu mượn không
        await this.checkBooksInLoanReceipt(bookIds, newBookLost.loanReceiptId, account);

        // Kiểm tra sách báo mất chưa
        await this.checkBookLostReported(bookIds, newBookLost.loanReceiptId, account);

        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            const lostReport = await db.BookLostReport.create(
                {
                    ...newBookLost,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { transaction }
            );

            const lostBookData = bookIds.map((bookId) => ({
                bookId,
                lostReportId: lostReport.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            await db.LostReportHasBook.bulkCreate(lostBookData, { transaction });

            await ActivityService.createActivity(
                { dataTarget: lostReport.id, tableTarget: TABLE_NAME.BOOK_LOST, action: ACTIVITY_TYPE.CREATED },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateBookLostById(updateBookLost, account) {
        const bookIds = updateBookLost.bookIds || [];
        const whereCondition = { active: true, schoolId: account.schoolId };

        const bookLost = await db.BookLostReport.findOne({
            where: { ...whereCondition, id: updateBookLost.id },
            attributes: ["id", "loanReceiptId"],
        });

        if (!bookLost) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        // Kiểm tra sách có trong phiếu mượn không
        await this.checkBooksInLoanReceipt(bookIds, bookLost.loanReceiptId, account);

        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            await db.BookLostReport.update(
                {
                    reportDes: updateBookLost.id,
                    updatedBy: account.id,
                },
                {
                    where: { ...whereCondition, id: updateBookLost.id },
                    transaction,
                }
            );

            const lostBookData = bookIds.map((bookId) => ({
                bookId,
                lostReportId: updateBookLost.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            await bulkUpdate(
                lostBookData,
                db.LostReportHasBook,
                { lostReportId: updateBookLost.id, schoolId: account.schoolId },
                account,
                transaction
            );

            await ActivityService.createActivity(
                { dataTarget: updateBookLost.id, tableTarget: TABLE_NAME.BOOK_LOST, action: ACTIVITY_TYPE.UPDATED },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getBookLostReports(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const { readerCode } = query;

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const whereBookLostCondition = {
            [Op.and]: [{ active: true }, { schoolId: account.schoolId }].filter(Boolean),
        };

        const searchableFields = ["fullName", "phone", "readerCode"];

        const whereUserCondition = {
            [Op.and]: [
                readerCode && { ...(readerCode && { readerCode: readerCode.toUpperCase() }) },
                { active: true, schoolId: account.schoolId },
                keyword && {
                    [Op.or]: [
                        ...searchableFields.map((field) =>
                            db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                                [Op.iLike]: `%${unidecode(keyword)}%`,
                            })
                        ),
                    ],
                },
            ].filter(Boolean),
        };

        const whereCondition = {
            [Op.and]: [{ active: true }, { schoolId: account.schoolId }].filter(Boolean),
        };

        const { rows, count } = await db.BookLostReport.findAndCountAll({
            where: whereBookLostCondition,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.LostReportHasBook,
                    as: "lostReportHasBook",
                    attributes: ["id"],
                    required: false,
                    where: whereCondition,
                    include: [
                        {
                            model: db.Book,
                            as: "book",
                            required: false,
                            attributes: ["id", "bookCode", "bookName", "otherName", "author", "price", "photoURL"],
                        },
                    ],
                },
                {
                    model: db.LoanReceipt,
                    as: "loanReceipt",
                    required: keyword || readerCode ? true : false,
                    attributes: ["id", "receiptCode", "receiveDate", "returnDate"],
                    where: whereCondition,
                    include: [
                        {
                            model: db.User,
                            as: "user",
                            required: keyword || readerCode ? true : false,
                            attributes: ["id", "fullName", "readerCode", "photoURL", "phone", "address"],
                            where: whereUserCondition,
                        },
                    ],
                },
            ],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: mapResponseBookLostList(rows),
        };
    }

    static async getBookLostReportById(id, account) {
        const whereCondition = {
            [Op.and]: [{ active: true }, { schoolId: account.schoolId }].filter(Boolean),
        };

        const bookLost = await db.BookLostReport.findOne({
            where: { ...whereCondition, id },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.LostReportHasBook,
                    as: "lostReportHasBook",
                    attributes: ["id"],
                    required: false,
                    where: whereCondition,
                    include: [
                        {
                            model: db.Book,
                            as: "book",
                            required: false,
                            attributes: ["id", "bookCode", "bookName", "otherName", "author", "price", "photoURL"],
                        },
                    ],
                },
                {
                    model: db.LoanReceipt,
                    as: "loanReceipt",
                    required: false,
                    attributes: ["id", "receiptCode", "receiveDate", "returnDate"],
                    where: whereCondition,
                    include: [
                        {
                            model: db.User,
                            as: "user",
                            required: false,
                            attributes: ["id", "fullName", "readerCode", "photoURL", "phone", "address"],
                            where: whereCondition,
                        },
                    ],
                },
            ],
            distinct: true,
        });

        if (!bookLost) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseBookLostItem(bookLost);
    }

    static async deleteBookLostReportByIds(ids, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        await db.BookLostReport.update(
            { active: false, updatedBy: account.id },
            { where: { ...whereCondition, id: { [Op.in]: ids } } }
        );

        await db.LostReportHasBook.update(
            { active: false, updatedBy: account.id },
            { where: { ...whereCondition, lostReportId: { [Op.in]: ids } } }
        );

        await ActivityService.createActivity(
            { dataTarget: JSON.stringify(ids), tableTarget: TABLE_NAME.BOOK_LOST, action: ACTIVITY_TYPE.DELETED },
            account
        );
    }
}

module.exports = BookLostService;
