const db = require("../models");
const unidecode = require("unidecode");
const { Op } = require("sequelize");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { TABLE_NAME } = require("../../enums/languages");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const ActivityService = require("./activityLog.service");
const { getPagination } = require("../../utils/customer-sequelize");

class LanguageService {
    static async getLanguages(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["lanName", "lanCode"];

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

        const { rows, count } = await db.Language.findAndCountAll({
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

    static async getLanguageById(id, account) {
        const language = await db.Language.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        if (!language) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return language;
    }

    static async createLanguage(newLanguage, account) {
        const language = await db.Language.create({
            ...newLanguage,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });

        await ActivityService.createActivity(
            { dataTarget: language.id, tableTarget: TABLE_NAME.LANGUAGE, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updateLanguageById(updateLanguage, account) {
        await db.Language.update(
            {
                lanName: updateLanguage.lanName,
                lanCode: updateLanguage.lanCode,
                lanDes: updateLanguage.lanDes,
                id: updateLanguage.id,
                schoolId: account.schoolId,
                updatedBy: account.id,
            },
            { where: { id: updateLanguage.id, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: updateLanguage.id, tableTarget: TABLE_NAME.LANGUAGE, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deleteLanguageByIds(ids, account) {
        await db.Language.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: JSON.stringify(ids), tableTarget: TABLE_NAME.LANGUAGE, action: ACTIVITY_TYPE.DELETED },
            account
        );
    }
}

module.exports = LanguageService;
