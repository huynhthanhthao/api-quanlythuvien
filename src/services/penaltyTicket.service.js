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
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE, QUERY_ONE_TYPE } = require("../../enums/common");
const { TABLE_NAME } = require("../../enums/languages");

class PenaltyTicketService {
    static async createPenaltyTicket(userId, bookList, setting, account, transaction) {
        let bookIds = bookList.map((book) => book.id);
        const whereCondition = { active: true, schoolId: account.schoolId };
        const penaltyTicketData = [];

        const countFinePolicy = await db.FinePolicy.count({ where: whereCondition });

        if (countFinePolicy == 0)
            throw new CatchException("Không tìm thấy phí phạt nào!", errorCodes.RESOURCE_NOT_FOUND);

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

        if (setting.noSpecialPenalties) {
            const bookNotApplyPenalties = await db.Book.findAll({
                where: {
                    ...whereCondition,
                    id: { [Op.in]: bookIds },
                },
                include: [
                    {
                        model: db.BookGroup,
                        as: "bookGroup",
                        where: { ...whereCondition, penaltyApplied: false },
                        required: true,
                        attributes: ["id"],
                    },
                ],
                attributes: ["id"],
            });

            const bookIdNotApplyPenalties = bookNotApplyPenalties.map((book) => +book.id);

            for (const bookId of bookIdNotApplyPenalties) {
                const { returnDate } = bookList.find((book) => book.id == bookId);
                const dayLate = -calculateDaysDiff(returnDate);

                penaltyTicketData.push({
                    ticketId: penaltyTicket.id,
                    bookId,
                    realityDayLate: dayLate,
                    penaltyFee: 0,
                    createdBy: account.id,
                    updatedBy: account.id,
                    schoolId: account.schoolId,
                });
            }

            bookIds = bookIds.filter((bookId) => !bookIdNotApplyPenalties.includes(+bookId));
        }
        // Phạt sách đặt biệt
        const bookSpecialWithFinePolicies = (await this.getBookSpecialWithFinePolicies(bookIds, account)) || [];
        for (const bookSpecial of bookSpecialWithFinePolicies) {
            const detailFinePolicy = bookSpecial?.finePolicyHasBook?.finePolicy?.detailFinePolicy;
            const finePolicy = bookSpecial?.finePolicyHasBook?.finePolicy;

            // Sắp xếp daylate tăng dần
            detailFinePolicy.sort((a, b) => a.dayLate - b.dayLate);
            const { returnDate } = bookList.find((book) => book.id == bookSpecial.id);

            const dayLate = -calculateDaysDiff(returnDate);
            const suitableFinePolicy = detailFinePolicy.find((finePolicy) => dayLate <= finePolicy.dayLate);
            if (suitableFinePolicy) {
                penaltyTicketData.push({
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                    realityDayLate: dayLate,
                    bookId: bookSpecial.id,
                    penaltyFee: suitableFinePolicy.fineAmount,
                    ticketId: penaltyTicket.id,
                });
            }

            if (!suitableFinePolicy) {
                const maxDetailFinePolicy = detailFinePolicy[detailFinePolicy.length - 1];

                penaltyTicketData.push({
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                    realityDayLate: dayLate,
                    bookId: bookSpecial.id,
                    penaltyFee:
                        maxDetailFinePolicy.fineAmount +
                        finePolicy.overdueFine * (dayLate - maxDetailFinePolicy.dayLate),
                    ticketId: penaltyTicket.id,
                });
            }
        }

        const bookIdSpecialWithFinePolicies = bookSpecialWithFinePolicies.map((book) => +book.id);
        bookIds = bookIds.filter((bookId) => !bookIdSpecialWithFinePolicies.includes(+bookId));

        // Phạt sách bình thường

        const finePolicyDefault = await db.FinePolicy.findOne({
            where: { ...whereCondition, isDefault: true },
            attributes: ["id", "overdueFine"],
            include: [
                {
                    model: db.DetailFinePolicy,
                    as: "detailFinePolicy",
                    attributes: ["id", "dayLate", "fineAmount"],
                    where: whereCondition,
                    required: true,
                },
            ],
        });

        for (const bookId of bookIds) {
            const { returnDate } = bookList.find((book) => book.id == bookId);
            const detailFinePolicy = finePolicyDefault?.detailFinePolicy;
            detailFinePolicy.sort((a, b) => a.dayLate - b.dayLate);

            const dayLate = -calculateDaysDiff(returnDate);
            const suitableFinePolicy = detailFinePolicy.find((finePolicy) => dayLate <= finePolicy.dayLate);

            if (suitableFinePolicy) {
                penaltyTicketData.push({
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                    realityDayLate: dayLate,
                    bookId: bookId,
                    penaltyFee: suitableFinePolicy.fineAmount,
                    ticketId: penaltyTicket.id,
                });
            }

            if (!suitableFinePolicy) {
                const maxDetailFinePolicy = detailFinePolicy[detailFinePolicy.length - 1];

                penaltyTicketData.push({
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                    realityDayLate: dayLate,
                    bookId: bookId,
                    penaltyFee:
                        maxDetailFinePolicy.fineAmount +
                        finePolicyDefault.overdueFine * (dayLate - maxDetailFinePolicy.dayLate),
                    ticketId: penaltyTicket.id,
                });
            }
        }

        await db.DetailPenaltyTicket.bulkCreate(penaltyTicketData, { transaction });

        await ActivityService.createActivity(
            { dataTarget: penaltyTicket.id, tableTarget: TABLE_NAME.PENALTY_TICKET, action: ACTIVITY_TYPE.CREATED },
            account,
            transaction
        );

        return penaltyTicket.id;
    }

    static async getBookSpecialWithFinePolicies(bookIds, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        return await db.Book.findAll({
            where: { ...whereCondition, id: { [Op.in]: bookIds } },
            include: [
                {
                    model: db.FinePolicyHasBook,
                    as: "finePolicyHasBook",
                    attributes: ["id"],
                    where: whereCondition,
                    required: true,
                    include: [
                        {
                            model: db.FinePolicy,
                            as: "finePolicy",
                            attributes: ["id", "overdueFine"],
                            where: whereCondition,
                            required: true,
                            include: [
                                {
                                    model: db.DetailFinePolicy,
                                    as: "detailFinePolicy",
                                    attributes: ["id", "dayLate", "fineAmount"],
                                    where: whereCondition,
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
            ],
            attributes: ["id"],
        });
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
                    attributes: ["id", "realityDayLate", "penaltyFee"],
                    include: [
                        {
                            model: db.Book,
                            as: "book",
                            where: whereCondition,
                            required: false,
                            attributes: ["id", "bookCode"],
                            include: [
                                {
                                    model: db.BookStatus,
                                    as: "status",
                                    where: whereCondition,
                                    required: false,
                                    attributes: ["statusName"],
                                },
                                {
                                    model: db.BookGroup,
                                    as: "bookGroup",
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
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: mapResponsePenaltyTicketList(rows),
        };
    }

    static async getPenaltyTicketByIdOrCode(query, account) {
        const { keyword } = query;
        const type = query.type || QUERY_ONE_TYPE.ID;

        const whereTicketCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (type == QUERY_ONE_TYPE.CODE) {
            whereTicketCondition.ticketCode = { [Op.iLike]: keyword };
        } else {
            whereTicketCondition.id = keyword;
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
                    attributes: ["id", "realityDayLate", "penaltyFee"],
                    include: [
                        {
                            model: db.Book,
                            as: "book",
                            where: whereCondition,
                            required: false,
                            attributes: ["id", "bookCode"],
                            include: [
                                {
                                    model: db.BookStatus,
                                    as: "status",
                                    where: whereCondition,
                                    required: false,
                                    attributes: ["statusName"],
                                },
                                {
                                    model: db.BookGroup,
                                    as: "bookGroup",
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
