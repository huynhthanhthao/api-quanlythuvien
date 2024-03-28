const unidecode = require("unidecode");
const db = require("../models");
const { Op } = require("sequelize");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const ActivityService = require("./activityLog.service");
const { TABLE_NAME } = require("../../enums/languages");
const { ACTIVITY_TYPE, DEFAULT_LIMIT, UNLIMITED } = require("../../enums/common");
const { getPagination } = require("../../utils/customer-sequelize");

class CardOpeningFeeService {
    static async createCardOpeningFee(newCardOpeningFee, account) {
        const cardOpeningFee = await db.CardOpeningFee.create({
            ...newCardOpeningFee,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });

        await ActivityService.createActivity(
            { dataTarget: cardOpeningFee.id, tableTarget: TABLE_NAME.CARD_OPENING_FEE, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updateCardOpeningFeeById(updateCardOpeningFee, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        await db.CardOpeningFee.update(
            {
                fee: updateCardOpeningFee.fee,
                effect: updateCardOpeningFee.effect,
                feeDes: updateCardOpeningFee.feeDes,
                updatedBy: account.id,
            },
            { where: { ...whereCondition, id: updateCardOpeningFee.id } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: updateCardOpeningFee.id,
                tableTarget: TABLE_NAME.CARD_OPENING_FEE,
                action: ACTIVITY_TYPE.UPDATED,
            },
            account
        );
    }

    static async deleteCardOpeningFeeByIds(ids, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        await db.CardOpeningFee.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { ...whereCondition, id: { [Op.in]: ids } } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(ids),
                tableTarget: TABLE_NAME.CARD_OPENING_FEE,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );
    }

    static async getCardOpeningFees(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["feeDes"];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const whereCondition = {
            [Op.and]: [
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

        const { rows, count } = await db.CardOpeningFee.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: rows,
        };
    }

    static async getCardOpeningFeeById(id, account) {
        const fee = await db.CardOpeningFee.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        if (!fee) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return fee;
    }
}

module.exports = CardOpeningFeeService;
