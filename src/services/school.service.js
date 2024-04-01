const db = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { QUERY_ONE_TYPE, FULL_ROLE_IDS } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");

class SchoolService {
    static async createSchool(newSchool) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const emailSMTP = await db.SchoolEmailSMTP.create({}, { transaction });

            const school = await db.School.create({ ...newSchool, schoolEmailSMTPId: emailSMTP.id }, { transaction });

            const user = await db.User.create(
                {
                    fullName: "Quản trị viênzzz",
                    schoolId: school.id,
                    birthday: "01/01/2000",
                    address: "Việt Nam",
                    email: newSchool.email,
                },
                { transaction }
            );

            const hashedPassword = await bcrypt.hash(newSchool.password, 10);

            const accounts = await db.Account.bulkCreate(
                [
                    {
                        schoolId: school.id,
                        userId: user.id,
                        username: newSchool.username,
                        password: hashedPassword,
                    },
                ],
                { transaction }
            );

            await db.AccountHasRole.bulkCreate(
                FULL_ROLE_IDS.map((id) => ({ roleId: id, accountId: accounts[0].id, schoolId: school.id })),
                { transaction }
            );

            await db.Setting.create(
                {
                    noSpecialPenalties: false,
                    hasFineFee: false,
                    hasLoanFee: false,
                    valueLoanFee: 0,
                    schoolId: school.id,
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateSchoolById(updateSchool) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateEmailSMTPBySchoolId(school) {}

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
