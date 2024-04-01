const db = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { QUERY_ONE_TYPE, FULL_ROLE_IDS, USER_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");

class SchoolService {
    static async createSchool(newSchool) {
        if (newSchool.secretKey != process.env.SECRET_KEY)
            throw new CatchException("Secret key không đúng!", errorCodes.INVALID_DATA);

        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const emailSMTP = await db.SchoolEmailSMTP.create({}, { transaction });

            const school = await db.School.create({ ...newSchool, schoolEmailSMTPId: emailSMTP.id }, { transaction });

            const user = await db.User.create(
                {
                    fullName: "Quản trị viên",
                    schoolId: school.id,
                    birthday: "01/01/2000",
                    address: "Việt Nam",
                    email: newSchool.email,
                    type: USER_TYPE.SYSTEM_USER,
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

    static async updateSchoolByToken(updateSchool, account) {
        const whereCondition = { active: true };

        await db.School.update(
            {
                logo: updateSchool.photoURL,
                schoolName: updateSchool.schoolName,
                address: updateSchool.address,
                phone: updateSchool.phone,
                email: updateSchool.email,
                representative: updateSchool.representative,
                representativePhone: updateSchool.representativePhone,
                updatedBy: account.id,
            },
            { where: { ...whereCondition, id: account.schoolId } }
        );
    }

    static async getSchoolByToken(query, account) {
        const whereCondition = { active: true, id: account.schoolId };

        const school = await db.School.findOne({
            where: whereCondition,
        });

        return school;
    }

    static async updateEmailSMTP(emailSMTPUpdate, account) {
        const whereCondition = { active: true };

        const school = await db.School.findOne({
            where: { ...whereCondition, id: account.schoolId },
            attributes: ["id", "schoolEmailSMTPId"],
        });

        await db.SchoolEmailSMTP.update(
            { email: emailSMTPUpdate.email, password: emailSMTPUpdate.password },
            { where: { ...whereCondition, id: school.schoolEmailSMTPId } }
        );
    }

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
