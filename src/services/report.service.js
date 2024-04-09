const { Op } = require("sequelize");
const db = require("../models");
const {
    mapResponseBorrowReturnReport,
    mapResponseReaderReport,
    mapResponseGetMostBorrowedBooksReport,
    mapResponseLoanReceiptReport,
} = require("../map-responses/report.map-response");
const { USER_TYPE } = require("../../enums/common");
const { getStartOfYear, getEndOfYear, convertDate } = require("../../utils/server");

class ReportService {
    static async borrowReturnReport(query, account) {
        const year = query.year || new Date().getFullYear();

        const whereCondition = { active: true, schoolId: account.schoolId };

        const dataReport = await db.ReceiptHasBook.findAll({
            where: {
                [Op.and]: [
                    whereCondition,
                    db.sequelize.literal(`EXTRACT('year' FROM "loanReceipt"."receiveDate") = ${year}`),
                ],
            },
            attributes: ["type"],
            include: [
                {
                    model: db.LoanReceipt,
                    as: "loanReceipt",
                    where: whereCondition,
                    required: false,
                    attributes: ["receiveDate", "returnDate"],
                },
            ],
        });

        return mapResponseBorrowReturnReport(dataReport);
    }

    static async readerReport(query, account) {
        const year = query.year || new Date().getFullYear();

        const whereCondition = { active: true, schoolId: account.schoolId };

        const dataReport = await db.User.findAll({
            where: {
                [Op.and]: [
                    whereCondition,
                    db.sequelize.literal(`DATE_PART('year', "User"."createdAt") = ${year}`),
                    { type: USER_TYPE.READER },
                ],
            },
            attributes: ["fullName", "readerCode", "photoURL", "phone", "createdAt"],
            include: [
                {
                    model: db.LoanReceipt,
                    as: "loanReceiptList",
                    where: {
                        [Op.and]: [
                            whereCondition,
                            db.sequelize.literal(`DATE_PART('year', "User"."createdAt") = ${year}`),
                        ],
                    },
                    required: false,
                    attributes: ["id", "receiveDate"],
                },
                {
                    model: db.ReaderGroup,
                    as: "readerGroup",
                    where: whereCondition,
                    required: false,
                    attributes: ["groupName", "quantityLimit", "timeLimit"],
                },
            ],
        });
        return mapResponseReaderReport(dataReport, year);
    }

    static async bookReport(query, account) {
        const year = query.year || new Date().getFullYear();
        const month = query.month || new Date().getMonth() + 1;
        const type = query.type || 1;

        if (type == 1) {
            // Danh mục có bao nhiêu sách
            return this.getCategoryBookCounts(year, account);
        }

        if (type == 2) {
            // Sách được mượn nhiều nhất trong tháng
            return this.getMostBorrowedBooksReport(month, year, account);
        }

        if (type == 3) {
            // Lĩnh vực có bao nhiêu sách
            return this.getFieldBookCounts(year, account);
        }

        if (type == 4) {
            // Sách cho mượn gần đây
            return this.recentBorrowedBooksReport(account);
        }
    }

    static async recentBorrowedBooksReport(account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const dataReport = await db.ReceiptHasBook.findAll({
            where: whereCondition,
            attributes: [
                "id",
                "createdAt",
                [db.sequelize.col("book.bookGroup.bookName"), "bookName"],
                [db.sequelize.col("book.bookGroup.author"), "author"],
                [db.sequelize.col("book.bookCode"), "bookCode"],
            ],
            include: [
                {
                    model: db.Book,
                    as: "book",
                    where: {
                        [Op.and]: whereCondition,
                    },
                    attributes: [],
                    include: [
                        {
                            model: db.BookGroup,
                            as: "bookGroup",
                            where: whereCondition,
                            attributes: [],
                        },
                    ],
                },
            ],
            limit: 10,
            order: [["createdAt", "DESC"]],
        });

        return dataReport;
    }

    static async getMostBorrowedBooksReport(month, year, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const dataReport = await db.BookGroup.findAll({
            where: whereCondition,
            attributes: [
                "id",
                "bookName",
                "author",
                "photoURL",
                [db.sequelize.fn("COUNT", db.sequelize.col("detailBooks.receiptHasBook.id")), "totalLoans"],
                [db.sequelize.col("category.categoryName"), "categoryName"],
            ],
            include: [
                {
                    model: db.Book,
                    as: "detailBooks",
                    attributes: [],
                    required: false,
                    include: [
                        {
                            model: db.ReceiptHasBook,
                            as: "receiptHasBook",
                            attributes: [],
                            required: false,
                            where: {
                                [Op.and]: [
                                    db.sequelize.literal(
                                        `EXTRACT('month' FROM "receiptHasBook"."createdAt") = ${month}`
                                    ),
                                    db.sequelize.literal(`EXTRACT('year' FROM "receiptHasBook"."createdAt") = ${year}`),
                                ],
                                [Op.and]: whereCondition,
                            },
                        },
                    ],
                },
                {
                    model: db.Category,
                    as: "category",
                    attributes: [],
                    required: false,
                },
            ],
            group: ["BookGroup.id", "category.id"],
        });

        return mapResponseGetMostBorrowedBooksReport(dataReport);
    }

    static async getCategoryBookCounts(year, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const dataReport = await db.Category.findAll({
            where: whereCondition,
            include: [
                {
                    model: db.BookGroup,
                    as: "bookList",
                    where: whereCondition,
                    include: [
                        {
                            model: db.Book,
                            as: "detailBooks",
                            where: {
                                [Op.and]: [
                                    whereCondition,
                                    { createdAt: { [Op.gte]: getStartOfYear(year) } },
                                    { createdAt: { [Op.lte]: getEndOfYear(year) } },
                                ],
                            },
                            attributes: [],
                        },
                    ],
                    attributes: [],
                },
            ],
            attributes: [
                "id",
                "categoryCode",
                "categoryName",
                [db.sequelize.fn("COUNT", db.sequelize.col("bookList.detailBooks.id")), "totalBooks"],
            ],
            group: ["Category.id"],
        });

        return dataReport;
    }

    static async getFieldBookCounts(year, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const dataReport = await db.Field.findAll({
            where: whereCondition,
            attributes: [
                "id",
                "fieldCode",
                "fieldName",
                [db.sequelize.fn("COUNT", db.sequelize.col("fieldHasBook.id")), "totalBooks"],
            ],
            include: [
                {
                    model: db.FieldHasBook,
                    as: "fieldHasBook",
                    where: {
                        [Op.and]: [
                            whereCondition,
                            db.sequelize.literal(`EXTRACT(YEAR FROM "fieldHasBook"."createdAt") = ${year}`),
                        ],
                    },
                    attributes: [],
                    required: false,
                    include: [
                        {
                            model: db.BookGroup,
                            as: "bookList",
                            where: whereCondition,
                            include: [
                                {
                                    model: db.Book,
                                    as: "detailBooks",
                                    where: {
                                        [Op.and]: [
                                            whereCondition,
                                            { createdAt: { [Op.gte]: getStartOfYear(year) } },
                                            { createdAt: { [Op.lte]: getEndOfYear(year) } },
                                        ],
                                    },
                                    attributes: [],
                                },
                            ],
                            attributes: [],
                        },
                    ],
                },
            ],
            subQuery: false,
            group: ["Field.id"],
        });

        return dataReport;
    }

    static async loanReceiptReport(query, account) {
        const year = query.year || new Date().getFullYear();

        const whereCondition = { active: true, schoolId: account.schoolId };

        const dataReport = await db.User.findAll({
            where: {
                [Op.and]: [whereCondition],
            },
            attributes: [
                "fullName",
                "readerCode",
                "photoURL",
                "phone",
                [db.sequelize.fn("COUNT", db.sequelize.col("loanReceiptList.id")), "totalLoans"],
            ],
            include: [
                {
                    model: db.LoanReceipt,
                    as: "loanReceiptList",
                    where: {
                        [Op.and]: [
                            whereCondition,
                            db.sequelize.literal(`EXTRACT('year' FROM "loanReceiptList"."createdAt") = ${year}`),
                        ],
                    },
                    required: false,
                    attributes: [],
                },
            ],
            group: ["User.id"],
            having: db.sequelize.literal('COUNT("loanReceiptList"."id") > 0'),
            order: [[db.sequelize.fn("COUNT", db.sequelize.col("loanReceiptList.id")), "DESC"]],
            limit: 10,
            subQuery: false,
        });

        return mapResponseLoanReceiptReport(dataReport);
    }
}

module.exports = ReportService;
