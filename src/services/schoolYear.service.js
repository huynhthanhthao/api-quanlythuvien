const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const { getPagination } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");

class SchoolYearService {
    static async createSchoolYear(newSchoolYear, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const countYear = await db.SchoolYear.count({ where: { ...whereCondition, year: newSchoolYear.year } });

        if (countYear > 0)
            throw new CatchException("Năm học đã tồn tại!", errorCodes.DATA_ALREADY_EXISTS, { field: "year" });

        const schoolYear = await db.SchoolYear.create({
            ...newSchoolYear,
            schoolId: account.schoolId,
            createdBy: account.id,
            updatedBy: account.id,
        });

        await ActivityService.createActivity(
            { dataTarget: schoolYear.id, tableTarget: TABLE_NAME.SCHOOL_YEAR, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updateSchoolYearById(updateSchoolYear, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        console.log(updateSchoolYear.id, 9999);
        const schoolYear = await db.SchoolYear.findOne({
            where: { ...whereCondition, year: updateSchoolYear.year, id: { [Op.notIn]: [updateSchoolYear.id] } },
            attributes: ["id"],
        });

        if (schoolYear)
            throw new CatchException("Năm học đã tồn tại!", errorCodes.DATA_ALREADY_EXISTS, { field: "year" });

        await db.SchoolYear.update(
            {
                year: updateSchoolYear.year,
                schoolYearDes: updateSchoolYear.schoolYearDes,
                updatedBy: account.id,
            },
            { where: { id: updateSchoolYear.id, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            { dataTarget: updateSchoolYear.id, tableTarget: TABLE_NAME.SCHOOL_YEAR, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deleteSchoolYearByIds(schoolYearIds, account) {
        await db.SchoolYear.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: schoolYearIds }, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(schoolYearIds),
                tableTarget: TABLE_NAME.SCHOOL_YEAR,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );
    }

    static async getSchoolYears(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const whereCondition = {
            [Op.and]: [{ active: true }, { schoolId: account.schoolId }].filter(Boolean),
        };

        const { rows, count } = await db.SchoolYear.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            attributes: ["id", "year", "schoolYearDes", "createdAt"],
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: rows,
        };
    }

    static async getSchoolYearById(id, account) {
        const schoolYear = await db.SchoolYear.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: ["id", "year", "schoolYearDes", "createdAt"],
        });

        if (!schoolYear) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return schoolYear;
    }
}

module.exports = SchoolYearService;
