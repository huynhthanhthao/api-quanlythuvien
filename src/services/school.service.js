const { Op } = require("sequelize");
const { QUERY_ONE_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const db = require("../models");

class SchoolService {
    static async createSchool(newSchool, account) {}

    static async getSchoolByIdOrDomain(query) {
        const type = query.type || QUERY_ONE_TYPE.ID;
        const { keyword = "" } = query;
        const whereCondition = { active: true };

        if (type == QUERY_ONE_TYPE.DOMAIN) {
            whereCondition.schoolDomain = { [Op.iLike]: keyword };
        } else {
            whereCondition.id = keyword;
        }

        const school = await db.School.findOne({ where: whereCondition });

        if (!school) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return school;
    }
}

module.exports = SchoolService;
