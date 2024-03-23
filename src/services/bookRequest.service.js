const { Op } = require("sequelize");
const db = require("../models");
const unidecode = require("unidecode");
const { CatchException } = require("../../utils/api-error");
const { getPagination } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { customerURL, convertToIntArray } = require("../../utils/server");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE, QUERY_ONE_TYPE } = require("../../enums/common");
const { mapResponseBookRequestList, mapResponseBookRequestItem } = require("../map-responses/bookRequest.map-response");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");

class BookRequestService {
    static async createBookRequest(newBookRequest, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const readerCode = newBookRequest.readerCode || (await this.generateBookRequestCode(account.schoolId));
            const bookRequest = await db.BookRequest.create(
                {
                    ...newBookRequest,
                    bookCode: readerCode,
                    photoURL: customerURL(newBookRequest.photoURL),
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { transaction }
            );

            await ActivityService.createActivity(
                { dataTarget: bookRequest.id, tableTarget: TABLE_NAME.BOOK_REQUEST, action: ACTIVITY_TYPE.CREATED },
                account,
                transaction
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateBookRequestById(updateBookRequest, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const updatePhotoURL = updateBookRequest.newPhotoURL;

            const bookCode = updateBookRequest.bookCode || (await this.generateBookRequestCode(account.schoolId));

            await db.BookRequest.update(
                {
                    id: updateBookRequest.id,
                    bookCode,
                    publisherId: updateBookRequest.publisherId ?? null,
                    categoryId: updateBookRequest.categoryId ?? null,
                    languageId: updateBookRequest.languageId ?? null,
                    bookName: updateBookRequest.bookName,
                    bookDes: updateBookRequest.bookDes,
                    otherName: updateBookRequest.otherName,
                    author: updateBookRequest.author,
                    yearPublication: updateBookRequest.yearPublication,
                    rePublic: updateBookRequest.rePublic,
                    requestDate: updateBookRequest.requestDate,
                    photoURL: customerURL(updatePhotoURL),
                    schoolId: account.schoolId,
                    updatedBy: account.id,
                },
                { where: { id: updateBookRequest.id, active: true, schoolId: account.schoolId }, transaction }
            );

            await ActivityService.createActivity(
                {
                    dataTarget: updateBookRequest.id,
                    tableTarget: TABLE_NAME.BOOK_REQUEST,
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

    static async getBookRequests(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const publisherIds = query.publisherIds ? convertToIntArray(query.publisherIds) : [];
        const languageIds = query.languageIds ? convertToIntArray(query.languageIds) : [];
        const rePublics = query.rePublics ? convertToIntArray(query.rePublics) : [];
        const categoryIds = query.categoryIds ? convertToIntArray(query.categoryIds) : [];

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

        const whereCategoryCondition = {
            ...(categoryIds.length > 0 && { id: { [Op.in]: categoryIds } }),
            active: true,
            schoolId: account.schoolId,
        };

        const { rows, count } = await db.BookRequest.findAndCountAll({
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
                    model: db.Language,
                    as: "language",
                    attributes: ["id", "lanName"],
                    where: whereLanguageCondition,
                    required: languageIds.length > 0 ? true : false,
                },
            ],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: mapResponseBookRequestList(rows, count),
        };
    }

    static async getBookRequestByIdOrCode(query, account) {
        const { keyword } = query;
        const type = query.type || QUERY_ONE_TYPE.ID;

        const whereBookRequestCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (type == QUERY_ONE_TYPE.CODE) {
            whereBookRequestCondition.bookCode = { [Op.iLike]: keyword };
        } else {
            whereBookRequestCondition.id = keyword;
        }

        const book = await db.BookRequest.findOne({
            where: whereBookRequestCondition,
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
            ],
        });

        if (!book) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseBookRequestItem(book);
    }

    static async deleteBookRequestByIds(bookIds, account) {
        await db.BookRequest.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: bookIds }, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(bookIds),
                tableTarget: TABLE_NAME.BOOK_REQUEST,
                action: ACTIVITY_TYPE.UPDATED,
            },
            account
        );
    }

    static async generateBookRequestCode(schoolId) {
        const { dataValues: highestBookRequest } = (await db.BookRequest.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("bookCode")), "maxBookRequestCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newBookRequestCode = "SBS00001";

        if (highestBookRequest && highestBookRequest?.maxBookRequestCode) {
            const currentNumber = parseInt(highestBookRequest.maxBookRequestCode.slice(3), 10);
            const nextNumber = currentNumber + 1;
            newBookRequestCode = `SBS${nextNumber.toString().padStart(5, "0")}`;
        }

        return newBookRequestCode;
    }
}

module.exports = BookRequestService;
