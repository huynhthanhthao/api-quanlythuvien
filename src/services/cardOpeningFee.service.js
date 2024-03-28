const { Op } = require("sequelize");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const ActivityService = require("./activityLog.service");
const db = require("../models");
const { TABLE_NAME } = require("../../enums/languages");
const { ACTIVITY_TYPE } = require("../../enums/common");

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

    static async deleteCardOpeningFeeByIds(ids, account) {}

    static async getCardOpeningFees(query, account) {}

    static async getCardOpeningFeeById(id, account) {}
}

module.exports = CardOpeningFeeService;
