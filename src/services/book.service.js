const { Op } = require("sequelize");
const db = require("../models");
const { customerURL, convertToIntArray } = require("../../utils/server");
const { DEFAULT_LIMIT, UNLIMITED, LOAN_STATUS, BOOK_CONDITION, ACTIVITY_TYPE } = require("../../enums/common");
const { bulkUpdate, getPagination } = require("../../utils/customer-sequelize");
const { mapResponseBookList, mapResponseBookItem } = require("../map-responses/book.map-response");
const unidecode = require("unidecode");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");
const ActivityService = require("./activityLog.service");
const { tableName } = require("../../enums/languages");

class BookService {
    static async createBook(newBook, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const bookCode = newBook.bookCode || (await this.generateBookCode(account.schoolId));

            const book = await db.Book.create(
                {
                    ...newBook,
                    bookCode: bookCode,
                    photoURL: customerURL(newBook.photoURL),
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { transaction }
            );

            const fieldIds = newBook.fieldIds || [];

            await db.FieldHasBook.bulkCreate(
                fieldIds.map((fieldId) => ({
                    fieldId,
                    bookId: book.id,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                })),
                { transaction }
            );

            const detailQuantity = newBook.detailQuantity || [];

            await db.BookHasStatus.bulkCreate(
                detailQuantity.map((detail) => ({
                    bookId: book.id,
                    statusId: detail.statusId,
                    quantity: detail.quantity,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                })),
                { transaction }
            );

            await ActivityService.createActivity(
                { dataTarget: bookCode, tableTarget: tableName.BOOK, action: ACTIVITY_TYPE.CREATED },
                transaction,
                account
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateBookById(updateBook, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const bookCode = updateBook.bookCode || (await this.generateBookCode(account.schoolId));

            const updatePhotoURL = updateBook.newPhotoURL;

            await db.Book.update(
                {
                    id: updateBook.id,
                    bookCode,
                    positionId: updateBook.positionId || null,
                    publisherId: updateBook.publisherId || null,
                    categoryId: updateBook.categoryId || null,
                    languageId: updateBook.languageId || null,
                    bookName: updateBook.bookName,
                    bookDes: updateBook.bookDes,
                    otherName: updateBook.otherName,
                    author: updateBook.author,
                    pages: updateBook.pages,
                    yearPublication: updateBook.yearPublication,
                    rePublic: updateBook.rePublic,
                    price: updateBook.price,
                    photoURL: customerURL(updatePhotoURL),
                    schoolId: account.schoolId,
                    updatedBy: account.id,
                },
                { where: { id: updateBook.id, active: true, schoolId: account.schoolId }, transaction }
            );

            const fieldIds = updateBook.fieldIds || [];

            const fieldList = fieldIds.map((fieldId) => ({
                fieldId,
                bookId: updateBook.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            await bulkUpdate(
                fieldList,
                db.FieldHasBook,
                { bookId: updateBook.id, schoolId: account.schoolId },
                account,
                transaction
            );

            const detailQuantity = updateBook.detailQuantity || [];

            const quantityData = detailQuantity.map((detail) => ({
                statusId: detail.statusId,
                quantity: detail.quantity,
                bookId: updateBook.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            await bulkUpdate(
                quantityData,
                db.BookHasStatus,
                { bookId: updateBook.id, schoolId: account.schoolId },
                account,
                transaction
            );

            await ActivityService.createActivity(
                { dataTarget: bookCode, tableTarget: tableName.BOOK, action: ACTIVITY_TYPE.UPDATED },
                transaction,
                account
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getBooks(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const publisherIds = query.publisherIds ? convertToIntArray(query.publisherIds) : [];
        const languageIds = query.languageIds ? convertToIntArray(query.languageIds) : [];
        const fieldIds = query.fieldIds ? convertToIntArray(query.fieldIds) : [];
        const rePublics = query.rePublics ? convertToIntArray(query.rePublics) : [];
        const statusIds = query.statusIds ? convertToIntArray(query.statusIds) : [];
        const categoryIds = query.categoryIds ? convertToIntArray(query.categoryIds) : [];
        const positionIds = query.positionIds ? convertToIntArray(query.positionIds) : [];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableFields = ["bookCode", "bookName", "author", "otherName"];

        const whereCondition = {
            [Op.and]: [
                query.rePublics && { rePublic: { [Op.in]: rePublics } },
                keyword && {
                    [Op.or]: searchableFields.map((field) =>
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        })
                    ),
                },
                { active: true },
                { schoolId: account.schoolId },
            ].filter(Boolean),
        };

        const wherePublisherCondition = {
            ...(publisherIds.length > 0 && { id: { [Op.in]: publisherIds } }),
            active: true,
            schoolId: account.schoolId,
        };

        const whereLanguageCondition = {
            ...(languageIds.length > 0 && { id: { [Op.in]: languageIds } }),
            active: true,
            schoolId: account.schoolId,
        };

        const whereFieldCondition = {
            ...(fieldIds.length > 0 && { fieldId: { [Op.in]: fieldIds } }),
            active: true,
            schoolId: account.schoolId,
        };

        const whereStatusCondition = {
            ...(statusIds.length > 0 && { statusId: { [Op.in]: statusIds } }),
            active: true,
            schoolId: account.schoolId,
        };

        const whereCategoryCondition = {
            ...(categoryIds.length > 0 && { id: { [Op.in]: categoryIds } }),
            active: true,
            schoolId: account.schoolId,
        };

        const wherePositionCondition = {
            ...(positionIds.length > 0 && { id: { [Op.in]: positionIds } }),
            active: true,
            schoolId: account.schoolId,
        };

        const { rows, count } = await db.Book.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: [
                    "updatedAt",
                    "createdBy",
                    "updatedBy",
                    "active",
                    "schoolId",
                    "publisherId",
                    "positionId",
                    "categoryId",
                    "languageId",
                    "statusId",
                ],
            },
            include: [
                {
                    model: db.Category,
                    as: "category",
                    where: whereCategoryCondition,
                    required: categoryIds.length > 0 ? true : false,
                    attributes: ["id", "categoryName"],
                },
                {
                    model: db.Publisher,
                    as: "publisher",
                    attributes: ["id", "pubName"],
                    where: wherePublisherCondition,
                    required: publisherIds.length > 0 ? true : false,
                },
                {
                    model: db.Position,
                    as: "position",
                    attributes: ["id", "positionName"],
                    where: wherePositionCondition,
                    required: positionIds.length > 0 ? true : false,
                },
                {
                    model: db.Language,
                    as: "language",
                    attributes: ["id", "lanName"],
                    where: whereLanguageCondition,
                    required: languageIds.length > 0 ? true : false,
                },
                {
                    model: db.FieldHasBook,
                    as: "fieldHasBook",
                    attributes: ["id"],
                    required: fieldIds.length > 0 ? true : false,
                    where: whereFieldCondition,
                    include: [
                        {
                            model: db.Field,
                            as: "field",
                            where: { active: true, schoolId: account.schoolId },
                            required: false,
                            attributes: ["id", "fieldName"],
                        },
                    ],
                },
                {
                    model: db.BookHasStatus,
                    as: "bookHasStatus",
                    attributes: ["id", "quantity"],
                    required: statusIds.length > 0 ? true : false,
                    where: whereStatusCondition,
                    include: [
                        {
                            model: db.BookStatus,
                            as: "status",
                            where: { active: true, schoolId: account.schoolId },
                            required: false,
                            attributes: ["id", "statusName"],
                        },
                    ],
                },
            ],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: mapResponseBookList(rows),
        };
    }

    static async getBookByIdOrCode(keyword, account) {
        const whereBookCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (isNaN(keyword)) {
            whereBookCondition.bookCode = keyword?.toUpperCase();
        } else {
            whereBookCondition.id = Number(keyword);
        }

        const book = await db.Book.findOne({
            where: whereBookCondition,
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId", "positionId", "statusId"],
            },
            include: [
                {
                    model: db.Category,
                    as: "category",
                    where: whereCondition,
                    required: false,
                    attributes: ["id", "categoryName"],
                },
                {
                    model: db.Publisher,
                    as: "publisher",
                    attributes: ["id", "pubName"],
                    where: whereCondition,
                    required: false,
                },
                {
                    model: db.Position,
                    as: "position",
                    attributes: ["id", "positionName"],
                    where: whereCondition,
                    required: false,
                },
                {
                    model: db.Language,
                    as: "language",
                    attributes: ["id", "lanName"],
                    where: whereCondition,
                    required: false,
                },
                {
                    model: db.FieldHasBook,
                    as: "fieldHasBook",
                    attributes: ["id"],
                    required: false,
                    where: whereCondition,
                    include: [
                        {
                            model: db.Field,
                            as: "field",
                            where: whereCondition,
                            required: false,
                            attributes: ["id", "fieldName"],
                        },
                    ],
                },
                {
                    model: db.BookHasStatus,
                    as: "bookHasStatus",
                    attributes: ["id", "quantity"],
                    required: false,
                    where: whereCondition,
                    include: [
                        {
                            model: db.BookStatus,
                            as: "status",
                            where: { active: true, schoolId: account.schoolId },
                            required: false,
                            attributes: ["id", "statusName"],
                        },
                    ],
                },
            ],
        });
        if (!book) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);
        return mapResponseBookItem(book);
    }

    static async deleteBookByIds(ids, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const bookHasLoanReceipt = await db.Book.findAll({
            where: { ...whereCondition, id: { [Op.in]: ids } },
            attributes: ["id", "bookCode"],
            include: [
                {
                    model: db.ReceiptHasBook,
                    as: "receiptHasBook",
                    attributes: ["id"],
                    where: { ...whereCondition },
                    required: true,
                },
            ],
        });

        if (bookHasLoanReceipt.length > 0)
            throw new CatchException("Không thể xóa sách này!", errorCodes.DATA_IS_BINDING, {
                field: "ids",
                ids: bookHasLoanReceipt.map((user) => user.id),
            });

        await db.Book.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, active: true, schoolId: account.schoolId } }
        );

        await db.FieldHasBook.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { bookId: { [Op.in]: ids }, active: true, schoolId: account.schoolId } }
        );

        await db.BookHasStatus.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { bookId: { [Op.in]: ids }, active: true, schoolId: account.schoolId } }
        );
    }

    static async generateBookCode(schoolId) {
        const { dataValues: highestBook } = (await db.Book.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("bookCode")), "maxBookCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newBookCode = "S00001";

        if (highestBook && highestBook?.maxBookCode) {
            const currentNumber = parseInt(highestBook.maxBookCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newBookCode = `S${nextNumber.toString().padStart(5, "0")}`;
        }

        return newBookCode;
    }

    static async getQuantityByBookIds(bookIds, loanReceiptId, schoolId) {
        const whereCondition = { active: true, schoolId };
        const bookList = await db.Book.findAll({
            where: { id: { [Op.in]: bookIds }, ...whereCondition },
            attributes: ["id", "bookName"],
            order: [["id", "ASC"]],
            include: [
                {
                    model: db.ReceiptHasBook,
                    as: "receiptHasBook",
                    required: false,
                    where: {
                        active: true,
                        type: LOAN_STATUS.BORROWING,
                        ...(loanReceiptId && { loanReceiptId: { [Op.notIn]: [loanReceiptId] } }),
                    },
                    attributes: ["id"],
                },
                {
                    model: db.BookHasStatus,
                    as: "bookHasStatus",
                    attributes: ["id", "quantity"],
                    required: false,
                    where: whereCondition,
                    include: [
                        {
                            model: db.BookStatus,
                            as: "status",
                            where: whereCondition,
                            required: false,
                            attributes: ["id", "statusName"],
                        },
                    ],
                },
            ],
        });

        return bookList.map((book) => ({
            id: book.id,
            amountBorrowed: book.receiptHasBook.length,
            maxQuantity: book?.bookHasStatus.reduce((acc, cur) => {
                return acc + cur.quantity;
            }, 0),
        }));
    }
}

module.exports = BookService;
