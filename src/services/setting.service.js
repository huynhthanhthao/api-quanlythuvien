const { Op } = require("sequelize");
const { UNLIMITED, DEFAULT_LIMIT } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const { getPagination } = require("../../utils/customer-sequelize");
const db = require("../models");

class SettingService {
    static async createSetting(newSetting, account) {
        await db.Setting.create({
            ...newSetting,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });
    }

    static async updateSettingById(updateSetting, account) {
        const whereCondition = { schoolId: account.schoolId, active: true };

        await db.Setting.update(
            { hasFineFee: updateSetting.hasFineFee, updatedBy: account.id },
            { where: { ...whereCondition, id: updateSetting.id } }
        );
    }

    static async deleteSettingByIds(ids, account) {
        await db.Setting.update(
            { id: { [Op.in]: ids }, active: false, updatedBy: account.id },
            { where: { ...whereCondition, id: updateSetting.id } }
        );
    }

    static async getSettingById(id, account) {
        const setting = await db.Setting.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        if (!setting) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return setting;
    }

    static async getSettingBySchoolId(account) {
        const setting = await db.Setting.findOne({
            where: { active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["createdAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        if (!setting) return null;

        return setting;
    }

    static async getSettings(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const whereCondition = {
            [Op.and]: [{ active: true }, { schoolId: account.schoolId }].filter(Boolean),
        };

        const { rows, count } = await db.Setting.findAndCountAll({
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
}

module.exports = SettingService;
