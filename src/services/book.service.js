const { Op } = require("sequelize");
const db = require("../models");
const unidecode = require("unidecode");
const { bulkUpdate, getPagination } = require("../../utils/customer-sequelize");
const { CatchException } = require("../../utils/api-error");
const ActivityService = require("./activityLog.service");
const { DEFAULT_LIMIT, UNLIMITED, LOAN_STATUS, ACTIVITY_TYPE, QUERY_ONE_TYPE } = require("../../enums/common");
const {
    mapResponseBookGroupItem,
    mapResponseBookGroupList,
    mapResponseBookItem,
    mapResponseBookGroupListPublic,
    mapResponseBookGroupItemPublic,
    mapResponseBookList,
} = require("../map-responses/book.map-response");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");
const { convertToIntArray } = require("../../utils/server");
const { checkStringIsDuplicates } = require("../../utils/customer-validate");

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

    static async updateBookGroupById(updateBookGroup, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            await db.BookGroup.update(
                {
                    id: updateBookGroup.id,
                    publisherId: updateBookGroup.publisherId,
                    categoryId: updateBookGroup.categoryId,
                    languageId: updateBookGroup.languageId,
                    bookName: updateBookGroup.bookName,
                    bookDes: updateBookGroup.bookDes,
                    otherName: updateBookGroup.otherName,
                    author: updateBookGroup.author,
                    pages: updateBookGroup.pages,
                    yearPublication: updateBookGroup.yearPublication,
                    rePublic: updateBookGroup.rePublic,
                    price: updateBookGroup.price,
                    photoURL: updateBookGroup.photoURL,
                    loanFee: updateBookGroup.loanFee,
                    penaltyApplied: updateBookGroup.penaltyApplied,
                    slug: updateBookGroup.slug?.trim(),
                    schoolId: account.schoolId,
                    updatedBy: account.id,
                },
                { where: { id: updateBookGroup.id, active: true, schoolId: account.schoolId }, transaction }
            );

            // check book code valid
            const detailBooks = updateBookGroup.detailBooks || [];

            // check book is borrowed but not found
            const bookIds = detailBooks.map((book) => +book.id);
            await this.checkBookBorrowedNotFound(updateBookGroup.id, bookIds, account);

            const bookCodes = detailBooks.map((book) => book.bookCode?.trim());
            await this.checkBookCodeValid(updateBookGroup.id, bookCodes, account);

            const fieldIds = updateBookGroup.fieldIds || [];
            const attachFiles = updateBookGroup.attachFiles || [];

            const fieldList = fieldIds.map((fieldId) => ({
                fieldId,
                bookGroupId: updateBookGroup.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            const attachFileData = attachFiles.map((file) => ({
                fileName: file.originalname,
                fileType: file.mimetype,
                fileURL: file.path,
                bookGroupId: updateBookGroup.id,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            const bookList = detailBooks.map((book) => ({
                id: book.id,
                bookGroupId: updateBookGroup.id,
                positionId: book.positionId,
                bookCode: book.bookCode?.trim(),
                statusId: book.statusId,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            const bulkUpdateCondition = { bookGroupId: updateBookGroup.id, schoolId: account.schoolId };

            await Promise.all([
                bulkUpdate(attachFileData, db.Attachment, bulkUpdateCondition, account, transaction),
                bulkUpdate(fieldList, db.FieldHasBook, bulkUpdateCondition, account, transaction),
                bulkUpdate(bookList, db.Book, bulkUpdateCondition, account, transaction),
            ]);

            await ActivityService.createActivity(
                { dataTarget: updateBookGroup.id, tableTarget: TABLE_NAME.BOOK, action: ACTIVITY_TYPE.UPDATED },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async checkBookBorrowedNotFound(bookGroupId, bookIds, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const borrowedBooks = await db.Book.findAll({
            where: whereCondition,
            attributes: ["id"],
            include: [
                {
                    model: db.BookGroup,
                    as: "bookGroup",
                    attributes: ["id"],
                    where: { ...whereCondition, id: bookGroupId },
                    required: true,
                },
                {
                    model: db.ReceiptHasBook,
                    as: "receiptHasBook",
                    attributes: ["id"],
                    where: whereCondition,
                    required: true,
                },
            ],
        });

        const borrowedBookIds = borrowedBooks.map((book) => +book.id) || [];

        const uniqueBorrowedIds = borrowedBookIds.filter((id) => !bookIds.includes(id));

        if (uniqueBorrowedIds.length > 0) {
            throw new CatchException("Không tìm thấy mã ấn phẩm đang cho mượn trước đó!", errorCodes.DATA_IS_CONFLICT, {
                field: "detailBooks",
            });
        }
    }

    static async getBookGroups(query, account) {
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
            list: mapResponseBookGroupList(rows),
        };
    }

    static async getBookGroupById(id, account) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const bookGroup = await db.BookGroup.findOne({
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

        if (!bookGroup) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseBookGroupItem(bookGroup);
    }

    static async deleteBookGroupByIds(ids, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const whereCondition = { active: true, schoolId: account.schoolId };

            const bookGroupHasLoanReceipt = await db.BookGroup.findAll({
                where: { ...whereCondition, id: { [Op.in]: ids } },
                attributes: ["id"],
                include: [
                    {
                        model: db.Book,
                        as: "detailBooks",
                        attributes: ["id"],
                        where: { ...whereCondition },
                        required: true,
                        include: [
                            {
                                model: db.ReceiptHasBook,
                                as: "receiptHasBook",
                                attributes: ["id"],
                                where: { ...whereCondition },
                                required: true,
                            },
                        ],
                    },
                ],
            });

            const borrowedBookGroupIds = bookGroupHasLoanReceipt.map((book) => +book.id);

            const validBookGroupIds = ids.filter((id) => !borrowedBookGroupIds.includes(+id));

            console.log(borrowedBookGroupIds, validBookGroupIds, 9999);

            await db.BookGroup.update(
                {
                    active: false,
                    updatedBy: account.id,
                },
                { where: { id: { [Op.in]: validBookGroupIds }, active: true, schoolId: account.schoolId }, transaction }
            );

            await db.FieldHasBook.update(
                {
                    active: false,
                    updatedBy: account.id,
                },
                {
                    where: { bookGroupId: { [Op.in]: validBookGroupIds }, active: true, schoolId: account.schoolId },
                    transaction,
                }
            );

            const bookIds = await this.getBookIdsByBookGroupId(validBookGroupIds, account);

            await db.Book.update(
                {
                    active: false,
                    updatedBy: account.id,
                },
                { where: { id: { [Op.in]: bookIds }, active: true, schoolId: account.schoolId }, transaction }
            );

            await ActivityService.createActivity(
                {
                    dataTarget: JSON.stringify(validBookGroupIds),
                    tableTarget: TABLE_NAME.BOOK,
                    action: ACTIVITY_TYPE.DELETED,
                },
                account,
                transaction
            );

            await transaction.commit();

            if (bookGroupHasLoanReceipt.length > 0)
                throw new CatchException("Không thể xóa sách này!", errorCodes.DATA_IS_BINDING, {
                    field: "ids",
                    ids: borrowedBookGroupIds,
                });
        } catch (error) {
            if (error instanceof CatchException) throw error;
            await transaction.rollback();
            throw error;
        }
    }

    static async getBookIdsByBookGroupId(bookGroupIds, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const books = await db.Book.findAll({
            where: { ...whereCondition, bookGroupId: { [Op.in]: bookGroupIds } },

            attributes: ["id"],
        });

        return books.map((book) => +book.id);
    }

    static async getBookByCode(bookCode, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const book = await db.Book.findOne({
            where: { ...whereCondition, bookCode: { [Op.iLike]: bookCode } },
            attributes: ["id", "bookCode"],
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
                    required: true,
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
                    ],
                },
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
        });

        if (!book) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseBookItem(book);
    }

    static async getPublicBookGroup(query, account) {
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
        const ids = query.ids ? convertToIntArray(query.ids) : [];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableFields = ["bookName", "author", "otherName"];

        const whereBookGroupCondition = {
            [Op.and]: [
                query.rePublics?.length > 0 && { rePublic: { [Op.in]: rePublics } },
                query.ids?.length > 0 && { id: { [Op.in]: ids } },
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
            where: whereBookGroupCondition,
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
                        {
                            model: db.ReceiptHasBook,
                            as: "receiptHasBook",
                            required: false,
                            attributes: ["id"],
                            where: { ...whereCommonCondition, type: LOAN_STATUS.BORROWING },
                            required: false,
                            limit: 1,
                        },
                    ],
                },
            ],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: mapResponseBookGroupListPublic(rows),
        };
    }

    static async getBookGroupPublic(query, account) {
        const { keyword } = query;
        const type = query.type || QUERY_ONE_TYPE.SLUG;

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereBookGroupCondition = { active: true, schoolId: account.schoolId };

        if (type == QUERY_ONE_TYPE.ID) whereBookGroupCondition.id = keyword;

        if (type == QUERY_ONE_TYPE.SLUG) whereBookGroupCondition.slug = { [Op.iLike]: keyword };

        const bookGroup = await db.BookGroup.findOne({
            where: { ...whereBookGroupCondition },
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
                    where: whereCondition,
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
                        {
                            model: db.ReceiptHasBook,
                            as: "receiptHasBook",
                            required: false,
                            attributes: ["id"],
                            where: { ...whereCondition, type: LOAN_STATUS.BORROWING },
                            required: false,
                            limit: 1,
                        },
                    ],
                },
            ],
        });

        if (!bookGroup) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseBookGroupItemPublic(bookGroup);
    }

    static async getBookDetail(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const ids = query.ids ? convertToIntArray(query.ids) : [];

        const whereBookCondition = {
            [Op.and]: [
                query.ids?.length > 0 && { id: { [Op.in]: ids } },
                { active: true },
                { schoolId: account.schoolId },
            ].filter(Boolean),
        };

        const whereCondition = {
            [Op.and]: [{ active: true }, { schoolId: account.schoolId }].filter(Boolean),
        };

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const { rows, count } = await db.Book.findAndCountAll({
            where: { ...whereBookCondition },
            limit,
            offset,
            attributes: ["id", "bookCode"],
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
                    required: true,
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
                    ],
                },
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
                {
                    model: db.ReceiptHasBook,
                    as: "receiptHasBook",
                    required: false,
                    attributes: ["id"],
                    where: { ...whereCondition, type: LOAN_STATUS.BORROWING },
                    required: false,
                    limit: 1,
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
