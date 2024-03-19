const { Op } = require("sequelize");
const db = require("../models");
const unidecode = require("unidecode");
const { CatchException } = require("../../utils/api-error");
const { getPagination } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { errorCodes } = require("../../enums/error-code");
const { calculateDaysDiff, fDate, convertToIntArray } = require("../../utils/server");
const {
    mapResponsePenaltyTicketItem,
    mapResponsePenaltyTicketList,
} = require("../map-responses/penaltyTicket.map-response");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { TABLE_NAME } = require("../../enums/languages");

class PenaltyTicketService {
    static async createPenaltyTicket(userId, bookList, account, transaction) {
        const penaltyTicketData = [];

        const penaltyTicket = await db.PenaltyTicket.create(
            {
                userId,
                ticketCode: await this.generateTicketCode(account.schoolId),
                createdBy: account.id,
                updatedBy: account.id,
                schoolId: account.schoolId,
            },
            { transaction }
        );

        const whereCondition = { active: true, schoolId: account.schoolId };

        const policyWithSpecialBooks = await db.FinePolicy.findAll({
            where: { ...whereCondition },
            include: [
                {
                    model: db.FinePolicyHasBook,
                    as: "finePolicyHasBook",
                    where: { ...whereCondition, bookId: { [Op.in]: bookList.map((book) => book.id) } },
                    required: true,
                    attributes: ["bookId"],
                },
            ],
            attributes: ["id"],
        });

        policyWithSpecialBooks.forEach((finePolicy, index) => {
            const bookTarget = bookList.find((book) => book.id == finePolicy?.finePolicyHasBook[0]?.bookId);

            const realityDayLate = -calculateDaysDiff(fDate(bookTarget.returnDate));

            penaltyTicketData.push({
                realityDayLate,
                schoolId: account.schoolId,
                ticketId: penaltyTicket.id,
                bookId: finePolicy?.finePolicyHasBook[0]?.bookId,
                finePolicyId: finePolicy.id,
                createdBy: account.id,
                updatedBy: account.id,
            });
        });

        const normalBooks = bookList
            .map((book) => {
                if (
                    !policyWithSpecialBooks.some((finePolicy) => {
                        return finePolicy?.finePolicyHasBook[0]?.bookId == book.id;
                    })
                ) {
                    const realityDayLate = -calculateDaysDiff(fDate(book.returnDate));

                    return { ...book, realityDayLate };
                }

                return null;
            })
            .filter(Boolean)
            .sort((a, b) => a.realityDayLate - b.realityDayLate);

        for (const book of normalBooks) {
            let finePolicies = [];

            finePolicies = await db.FinePolicy.findAll({
                where: { ...whereCondition, dayLate: { [Op.gte]: book.realityDayLate } },
                attributes: ["id"],
                order: [["dayLate", "ASC"]],
                limit: 1,
            });

            if (finePolicies.length == 0) {
                finePolicies = await db.FinePolicy.findAll({
                    where: { ...whereCondition, dayLate: { [Op.lte]: book.realityDayLate } },
                    attributes: ["id"],
                    order: [["dayLate", "DESC"]],
                    limit: 1,
                });

                throw new CatchException("Không tìm thấy phí phạt tương ứng.", errorCodes.RESOURCE_NOT_FOUND, {
                    field: "finePolicyId",
                    book,
                });
            }

            penaltyTicketData.push({
                schoolId: account.schoolId,
                ticketId: penaltyTicket.id,
                bookId: book.id,
                realityDayLate: book.realityDayLate,
                finePolicyId: finePolicies[0].id,
                createdBy: account.id,
                updatedBy: account.id,
            });
        }

        await db.DetailPenaltyTicket.bulkCreate(penaltyTicketData, { transaction });

        await ActivityService.createActivity(
            { dataTarget: penaltyTicket.id, tableTarget: TABLE_NAME.PENALTY_TICKET, action: ACTIVITY_TYPE.CREATED },
            account,
            transaction
        );

        return penaltyTicket.id;
    }

    static async payPenaltyTicket(ticket, account) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        await db.PenaltyTicket.update(
            { status: ticket.status, updatedBy: account.id },
            { where: { ...whereCondition, id: ticket.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: ticket.id, tableTarget: TABLE_NAME.PENALTY_TICKET, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deletePenaltyTicketByIds(ticketIds, account) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        await db.PenaltyTicket.update(
            { active: false, updatedBy: account.id },
            { where: { ...whereCondition, id: { [Op.in]: ticketIds } } }
        );

        await db.DetailPenaltyTicket.update(
            { active: false, updatedBy: account.id },
            { where: { ...whereCondition, finePolicyId: { [Op.in]: ticketIds } } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(ticketIds),
                tableTarget: TABLE_NAME.PENALTY_TICKET,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );
    }

    static async getPenaltyTickets(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const statusIds = query.statusIds ? convertToIntArray(query.statusIds) : [];
        const readerCode = query.readerCode;
        const ticketCode = query.ticketCode;

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableFields = ["ticketCode"];

        const whereTicketCondition = {
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
                statusIds.length > 0 && { status: { [Op.in]: statusIds } },
                ticketCode && { ticketCode: ticketCode.toUpperCase() },
                { active: true },
                { schoolId: account.schoolId },
            ].filter(Boolean),
        };

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereUserCondition = {
            ...(readerCode && { readerCode: readerCode.toUpperCase() }),
            active: true,
            schoolId: account.schoolId,
        };

        const { rows, count } = await db.PenaltyTicket.findAndCountAll({
            where: whereTicketCondition,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.User,
                    as: "user",
                    where: whereUserCondition,
                    required: keyword || readerCode ? true : false,
                    attributes: ["id", "fullName", "photoURL", "phone", "readerCode", "email"],
                },
                {
                    model: db.DetailPenaltyTicket,
                    as: "detailPenaltyTicket",
                    where: whereCondition,
                    required: false,
                    attributes: ["id", "realityDayLate"],
                    include: [
                        {
                            model: db.Book,
                            as: "book",
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
                                    "positionId",
                                    "publisherId",
                                    "categoryId",
                                    "languageId",
                                    "statusId",
                                ],
                            },
                        },
                        {
                            model: db.FinePolicy,
                            as: "finePolicy",
                            where: whereCondition,
                            required: false,
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                            },
                        },
                    ],
                },
            ],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: mapResponsePenaltyTicketList(rows),
        };
    }

    static async getPenaltyTicketByIdOrCode(keyword, account) {
        const whereTicketCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (isNaN(keyword)) {
            whereTicketCondition.bookCode = keyword?.toUpperCase();
        } else {
            whereTicketCondition.id = Number(keyword);
        }

        const penaltyTicket = await db.PenaltyTicket.findOne({
            where: whereTicketCondition,
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId", "userId"],
            },
            include: [
                {
                    model: db.User,
                    as: "user",
                    where: whereCondition,
                    required: false,
                    attributes: ["id", "fullName", "photoURL", "phone", "readerCode", "email"],
                },
                {
                    model: db.DetailPenaltyTicket,
                    as: "detailPenaltyTicket",
                    where: whereCondition,
                    required: false,
                    attributes: ["id", "realityDayLate"],
                    include: [
                        {
                            model: db.Book,
                            as: "book",
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
                                    "positionId",
                                    "publisherId",
                                    "categoryId",
                                    "languageId",
                                    "statusId",
                                ],
                            },
                        },
                        {
                            model: db.FinePolicy,
                            as: "finePolicy",
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

        if (!penaltyTicket) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponsePenaltyTicketItem(penaltyTicket);
    }

    static async generateTicketCode(schoolId) {
        const { dataValues: highestPenalty } = (await db.PenaltyTicket.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("ticketCode")), "maxTicketCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newTicketCode = "PP00001";

        if (highestPenalty && highestPenalty?.maxTicketCode) {
            const currentNumber = parseInt(highestPenalty.maxTicketCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newTicketCode = `PP${nextNumber.toString().padStart(5, "0")}`;
        }

        return newTicketCode;
    }
}

module.exports = PenaltyTicketService;
