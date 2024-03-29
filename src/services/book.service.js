const { Op } = require("sequelize");
const db = require("../models");
const unidecode = require("unidecode");
const { bulkUpdate, getPagination } = require("../../utils/customer-sequelize");
const { CatchException } = require("../../utils/api-error");
const ActivityService = require("./activityLog.service");
const { DEFAULT_LIMIT, UNLIMITED, LOAN_STATUS, ACTIVITY_TYPE, QUERY_ONE_TYPE } = require("../../enums/common");
const { mapResponseBookList, mapResponseBookItem } = require("../map-responses/book.map-response");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");
const { customerURL, convertToIntArray } = require("../../utils/server");
const { checkIsDuplicates, checkStringIsDuplicates } = require("../../utils/customer-validate");

class BookService {
    static async createBook(newBook, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const bookGroup = await db.BookGroup.create(
                {
                    publisherId: newBook.publisherId,
                    categoryId: newBook.categoryId,
                    languageId: newBook.languageId,
                    bookName: newBook.bookName,
                    bookDes: newBook.bookDes,
                    otherName: newBook.otherName,
                    author: newBook.author,
                    pages: newBook.pages,
                    yearPublication: newBook.yearPublication,
                    rePublic: newBook.rePublic,
                    price: newBook.price,
                    photoURL: newBook.photoURL,
                    loanFee: newBook.loanFee,
                    penaltyApplied: newBook.penaltyApplied,
                    slug: newBook.slug,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { transaction }
            );

            const detailBooks = newBook.detailBooks || [];

            // check book code valid
            const bookCodes = detailBooks.map((book) => book.bookCode?.trim());
            await this.checkBookCodeValid(bookGroup.id, bookCodes, account);

            const fieldIds = newBook.fieldIds || [];
            const attachFiles = newBook.attachFiles || [];

            const bulkCreateBooks = db.Book.bulkCreate(
                detailBooks.map((book) => ({
                    bookGroupId: bookGroup.id,
                    positionId: book.positionId,
                    bookCode: book.bookCode?.trim(),
                    statusId: book.statusId,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                })),
                { transaction }
            );

            const bulkCreateFieldHasBooks = db.FieldHasBook.bulkCreate(
                fieldIds.map((fieldId) => ({
                    fieldId,
                    bookGroupId: bookGroup.id,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                })),
                { transaction }
            );

            const bulkCreateAttachments = db.Attachment.bulkCreate(
                attachFiles.map((file) => ({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileURL: file.path,
                    bookId: bookGroup.id,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                })),
                { transaction }
            );

            await Promise.all([bulkCreateBooks, bulkCreateFieldHasBooks, bulkCreateAttachments]);

            await ActivityService.createActivity(
                { dataTarget: bookGroup.id, tableTarget: TABLE_NAME.BOOK, action: ACTIVITY_TYPE.CREATED },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async checkBookCodeValid(bookGroupId, bookCodes, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        if (checkStringIsDuplicates(bookCodes))
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "bookCodes",
            });

        const books = await db.Book.findAll({
            where: { ...whereCondition, bookCode: { [Op.in]: bookCodes } },
            attributes: ["id", "bookCode"],
            include: [
                {
                    model: db.BookGroup,
                    as: "bookGroup",
                    where: { ...whereCondition, id: { [Op.not]: bookGroupId } },
                    required: true,
                    attributes: ["id"],
                },
            ],
        });

        if (books.length > 0)
            throw new CatchException("Mã sách đã tồn tại!", errorCodes.DATA_ALREADY_EXISTS, {
                field: "detailBooks",
                bookCodes: books.map((book) => book.bookCode),
            });
    }

    static async updateBookById(updateBook, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            await db.BookGroup.update(
                {
                    id: updateBook.id,
                    publisherId: updateBook.publisherId,
                    categoryId: updateBook.categoryId,
                    languageId: updateBook.languageId,
                    bookName: updateBook.bookName,
                    bookDes: updateBook.bookDes,
                    otherName: updateBook.otherName,
                    author: updateBook.author,
                    pages: updateBook.pages,
                    yearPublication: updateBook.yearPublication,
                    rePublic: updateBook.rePublic,
                    price: updateBook.price,
                    photoURL: updateBook.photoURL,
                    loanFee: updateBook.loanFee,
                    penaltyApplied: updateBook.penaltyApplied,
                    slug: updateBook.slug?.trim(),
                    schoolId: account.schoolId,
                    updatedBy: account.id,
                },
                { where: { id: updateBook.id, active: true, schoolId: account.schoolId }, transaction }
            );

            // check book code valid
            const detailBooks = updateBook.detailBooks || [];

            const bookCodes = detailBooks.map((book) => book.bookCode?.trim());
            await this.checkBookCodeValid(updateBook.id, bookCodes, account);

            const fieldIds = updateBook.fieldIds || [];
            const attachFiles = updateBook.attachFiles || [];

            const fieldList = fieldIds.map((fieldId) => ({
                fieldId,
                bookGroupId: updateBook.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            const attachFileData = attachFiles.map((file) => ({
                fileName: file.originalname,
                fileType: file.mimetype,
                fileURL: file.path,
                bookGroupId: updateBook.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            const bookList = detailBooks.map((book) => ({
                bookGroupId: updateBook.id,
                positionId: book.positionId,
                bookCode: book.bookCode?.trim(),
                statusId: book.statusId,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            const bulkUpdateCondition = { bookGroupId: updateBook.id, schoolId: account.schoolId };

            await Promise.all([
                bulkUpdate(attachFileData, db.Attachment, bulkUpdateCondition, account, transaction),
                bulkUpdate(fieldList, db.FieldHasBook, bulkUpdateCondition, account, transaction),
                bulkUpdate(bookList, db.Book, bulkUpdateCondition, account, transaction),
            ]);

            await ActivityService.createActivity(
                { dataTarget: updateBook.id, tableTarget: TABLE_NAME.BOOK, action: ACTIVITY_TYPE.UPDATED },
                account,
                transaction
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

        const searchableFields = ["bookName", "author", "otherName"];

        const whereCondition = {
            [Op.and]: [
                query.rePublics?.length > 0 && { rePublic: { [Op.in]: rePublics } },
                keyword && {
                    [Op.or]: [
                        ...searchableFields.map((field) =>
                            db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                                [Op.iLike]: `%${unidecode(keyword)}%`,
                            })
                        ),
                    ],
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

        const whereCategoryCondition = {
            ...(categoryIds.length > 0 && { id: { [Op.in]: categoryIds } }),
            active: true,
            schoolId: account.schoolId,
        };

        const whereDetailBookCondition = {
            ...(statusIds.length > 0 && { statusId: { [Op.in]: statusIds } }),
            ...(positionIds.length > 0 && { positionId: { [Op.in]: positionIds } }),
            active: true,
            schoolId: account.schoolId,
        };
        const whereCommonCondition = { active: true, schoolId: account.schoolId };

        const { rows, count } = await db.BookGroup.findAndCountAll({
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
                    "categoryId",
                    "languageId",
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
                            where: whereCommonCondition,
                            required: false,
                            attributes: ["id", "fieldName"],
                        },
                    ],
                },

                {
                    model: db.Attachment,
                    required: false,
                    as: "attachFiles",
                    where: whereCommonCondition,
                    attributes: ["id", "fileURL", "fileName"],
                },
                {
                    model: db.Book,
                    as: "detailBooks",
                    where: whereDetailBookCondition,
                    required: statusIds.length > 0 || positionIds.length > 0 ? true : false,
                    attributes: ["bookCode", "id"],
                    include: [
                        {
                            model: db.BookStatus,
                            required: false,
                            as: "status",
                            where: whereCommonCondition,
                            attributes: ["id", "statusName"],
                        },
                        {
                            model: db.Position,
                            as: "position",
                            required: false,
                            attributes: ["id", "positionName"],
                            where: whereCommonCondition,
                            required: false,
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

    static async getBookById(id, account) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        return await db.BookGroup.findOne({
            where: { ...whereCondition, id },
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
                    model: db.Attachment,
                    required: false,
                    as: "attachFiles",
                    where: { active: true, schoolId: account.schoolId },
                    attributes: ["id", "fileURL", "fileName"],
                },
                {
                    model: db.Book,
                    as: "detailBooks",
                    where: whereCondition,
                    required: false,
                    attributes: ["bookCode", "id"],
                    include: [
                        {
                            model: db.BookStatus,
                            required: false,
                            as: "status",
                            where: whereCondition,
                            attributes: ["id", "statusName"],
                        },
                        {
                            model: db.Position,
                            as: "position",
                            required: false,
                            attributes: ["id", "positionName"],
                            where: whereCondition,
                            required: false,
                        },
                    ],
                },
            ],
        });
    }

    static async getBookByCode(bookCode, account) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };
        return await db.Book.findOne({
            where: { ...whereCondition, bookCode: { [Op.iLike]: bookCode } },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.BookGroup,
                    as: "bookGroup",
                    attributes: {
                        exclude: [
                            "updatedAt",
                            "createdBy",
                            "updatedBy",
                            "active",
                            "schoolId",
                            "positionId",
                            "statusId",
                        ],
                    },
                    where: whereCondition,
                    required: false,
                },
            ],
        });
    }

    static async getBookByIdOrCode(query, account) {
        let book = null;

        if (query.type == QUERY_ONE_TYPE.ID) {
            book = await this.getBookById(query.keyword, account);
        }

        if (query.type == QUERY_ONE_TYPE.CODE) {
            book = await this.getBookByCode(query.keyword, account);
        }

        if (!book) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return query.type == QUERY_ONE_TYPE.ID ? mapResponseBookItem(book) : book;
    }

    static async deleteBookByIds(ids, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
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

            const borrowedBookIds = bookHasLoanReceipt.map((book) => +book.id);

            const validBookIds = ids.filter((id) => !borrowedBookIds.includes(+id));

            await db.Book.update(
                {
                    active: false,
                    updatedBy: account.id,
                },
                { where: { id: { [Op.in]: validBookIds }, active: true, schoolId: account.schoolId }, transaction }
            );

            await db.FieldHasBook.update(
                {
                    active: false,
                    updatedBy: account.id,
                },
                { where: { bookId: { [Op.in]: validBookIds }, active: true, schoolId: account.schoolId }, transaction }
            );

            await ActivityService.createActivity(
                {
                    dataTarget: JSON.stringify(validBookIds),
                    tableTarget: TABLE_NAME.BOOK,
                    action: ACTIVITY_TYPE.DELETED,
                },
                account,
                transaction
            );

            await transaction.commit();

            if (bookHasLoanReceipt.length > 0)
                throw new CatchException("Không thể xóa sách này!", errorCodes.DATA_IS_BINDING, {
                    field: "ids",
                    ids: borrowedBookIds,
                });
        } catch (error) {
            if (error instanceof CatchException) throw error;
            await transaction.rollback();
            throw error;
        }
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
}

module.exports = BookService;
