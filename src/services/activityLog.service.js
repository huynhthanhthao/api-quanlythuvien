const { Op } = require("sequelize");
const { UNLIMITED, DEFAULT_LIMIT } = require("../../enums/common");
const { getPagination } = require("../../utils/customer-sequelize");
const db = require("../models");

class ActivityService {
    static async createActivity(newActivity, transaction, account) {
        await db.ActivityLog.create(
            {
                ...newActivity,
                createdBy: account.id,
                updatedBy: account.id,
                schoolId: account.schoolId,
            },
            { transaction }
        );
    }

    static async getActivities(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const whereCondition = {
            [Op.and]: [{ active: true }, { schoolId: account.schoolId }].filter(Boolean),
        };

        const { rows, count } = await db.ActivityLog.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            attributes: [
                [db.sequelize.col("account.username"), "username"],
                "id",
                "dataTarget",
                "tableTarget",
                "action",
                "createdAt",
            ],
            include: [
                {
                    model: db.Account,
                    as: "account",
                    where: whereCondition,
                    required: false,
                    attributes: [],
                },
            ],
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: rows,
        };
    }
}

module.exports = ActivityService;
