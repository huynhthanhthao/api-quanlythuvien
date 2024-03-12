const { Op, literal } = require("sequelize");
const db = require("../models");
const { mapResponseBorrowReturnReport, mapResponseReaderReport } = require("../map-responses/report.map-response");

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
                [Op.and]: [whereCondition, db.sequelize.literal(`DATE_PART('year', "User"."createdAt") = ${year}`)],
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
            return this.getMostBorrowedBooksReport(month, account);
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
            attributes: ["id", [db.sequelize.col("book.bookName"), "bookName"], "createdAt"],
            include: [
                {
                    model: db.Book,
                    as: "book",
                    attributes: [],
                },
            ],
            limit: 10,
            order: [["createdAt", "DESC"]],
        });

        return dataReport;
    }

    static async getMostBorrowedBooksReport(month, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const dataReport = await db.Book.findAll({
            where: whereCondition,
            attributes: [
                "id",
                "bookName",
                "bookCode",
                "author",
                "photoURL",
                [db.sequelize.fn("COUNT", db.sequelize.col("receiptHasBook.id")), "totalLoans"],
                [db.sequelize.col("category.categoryName"), "categoryName"],
            ],
            include: [
                {
                    model: db.ReceiptHasBook,
                    as: "receiptHasBook",
                    where: {
                        [Op.and]: [
                            whereCondition,
                            db.sequelize.literal(`EXTRACT('month' FROM "receiptHasBook"."createdAt") = ${month}`),
                        ],
                    },
                    attributes: [],
                    required: false,
                },
                {
                    model: db.Category,
                    as: "category",
                    attributes: [],
                },
            ],
            group: ["Book.id", "category.id"],
            order: [[db.sequelize.fn("COUNT", db.sequelize.col("receiptHasBook.id")), "DESC"]],
            limit: 10,
            subQuery: false,
        });

        return dataReport;
    }

    static async getCategoryBookCounts(year, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const dataReport = await db.Category.findAll({
            where: whereCondition,
            attributes: [
                "categoryCode",
                "categoryName",
                [db.sequelize.fn("COUNT", db.sequelize.col("bookList.id")), "totalBooks"],
            ],
            include: [
                {
                    model: db.Book,
                    as: "bookList",
                    where: {
                        [Op.and]: [
                            whereCondition,
                            db.sequelize.literal(`EXTRACT(year FROM "bookList"."createdAt") = ${year}`),
                        ],
                    },
                    attributes: [],
                    required: false,
                },
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
                            model: db.Book,
                            as: "book",
                            where: {
                                [Op.and]: [whereCondition],
                            },
                            attributes: [],
                            required: false,
                        },
                    ],
                },
            ],
            group: ["Field.id"],
        });

        return dataReport;
    }
}

module.exports = ReportService;
