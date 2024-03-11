const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const { DEFAULT_LIMIT, UNLIMITED } = require("../../enums/common");
const { flattenArray, customerURL, convertToIntArray } = require("../../utils/server");
const { getPagination } = require("../../utils/customer-sequelize");
const { mapResponseUserList, mapResponseUserItem } = require("../map-responses/user.map-response");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");

class UserService {
    static async createUser(newUser, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            let readerCode = await this.generateReaderCode(account.schoolId);

            const user = await db.User.create(
                {
                    ...newUser,
                    photoURL: customerURL(newUser.photoURL),
                    readerCode,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { transaction }
            );

            if (newUser.classId)
                await db.ClassHasUser.create(
                    {
                        userId: user.id,
                        classId: newUser.classId,
                        schoolId: account.schoolId,
                        createdBy: account.id,
                        updatedBy: account.id,
                    },
                    { transaction }
                );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateUserById(updateUser, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const updatePhotoURL = updateUser.newPhotoURL;

            await db.User.update(
                {
                    id: updateUser.id,
                    fullName: updateUser.fullName,
                    groupId: updateUser.groupId,
                    phone: updateUser.phone,
                    birthday: updateUser.birthday,
                    gender: updateUser.gender,
                    address: updateUser.address,
                    email: updateUser.email,
                    readerDes: updateUser.readerDes,
                    cardId: updateUser.cardId,
                    cardDate: updateUser.cardDate,
                    cardAddress: updateUser.cardAddress,
                    photoURL: customerURL(updatePhotoURL),
                    schoolId: account.schoolId,
                    updatedBy: account.id,
                },
                { where: { id: updateUser.id, active: true, schoolId: account.schoolId } }
            );

            if (updateUser.classId) {
                const latestRecord = await db.ClassHasUser.findAll({
                    where: { userId: updateUser.id, active: true, schoolId: account.schoolId },
                    order: [["createdAt", "DESC"]],
                    limit: 1,
                    transaction,
                });

                if (latestRecord.length > 0) {
                    await latestRecord[0].update(
                        {
                            classId: updateUser.classId,
                            updatedBy: account.id,
                        },
                        { transaction }
                    );
                }
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getUsers(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const groupIds = query.groupIds ? convertToIntArray(query.groupIds) : [];
        const classIds = query.classIds ? convertToIntArray(query.classIds) : [];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableFields = ["fullName", "readerCode", "phone", "address", "email", "cardId"];

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
            [Op.and]: [
                query.groupIds && { groupId: { [Op.in]: groupIds } },
                keyword && {
                    [Op.or]: searchableFields.map((field) => {
                        return db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        });
                    }),
                },
            ].filter(Boolean),
        };

        const whereClassCondition = {
            id: { [Op.in]: classIds },
            schoolId: account.schoolId,
            active: true,
        };

        const { rows, count } = await db.User.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.ReaderGroup,
                    as: "readerGroup",
                    required: false,
                    where: { active: true },
                    attributes: ["id", "groupName"],
                },
                {
                    model: db.ClassHasUser,
                    as: "classHasUser",
                    required: false,
                    attributes: ["userId", "createdAt"],
                    order: [["createdAt", "DESC"]],
                    where: { active: true },
                    include: [
                        {
                            model: db.Class,
                            as: "class",
                            attributes: ["id", "className"],
                            include: [
                                {
                                    model: db.SchoolYear,
                                    as: "schoolYear",
                                    attributes: ["year"],
                                },
                            ],
                            required: classIds.length > 0 ? true : false,
                            where: whereClassCondition,
                        },
                    ],
                },
            ],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: mapResponseUserList(rows),
        };
    }

    static async getUserByIdOrCode(keyword, account) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (isNaN(keyword)) {
            whereCondition.readerCode = keyword?.toUpperCase();
        } else {
            whereCondition.id = Number(keyword);
        }

        const user = await db.User.findOne({
            where: whereCondition,
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.ReaderGroup,
                    as: "readerGroup",
                    where: { active: true },
                    required: false,
                    attributes: ["id", "groupName"],
                },
                {
                    model: db.ClassHasUser,
                    as: "classHasUser",
                    where: { active: true },
                    required: false,
                    attributes: ["userId", "createdAt"],
                    order: [["createdAt", "DESC"]],
                    include: [
                        {
                            model: db.Class,
                            as: "class",
                            attributes: ["id", "className"],
                            required: false,
                            where: { active: true },
                            include: [
                                {
                                    model: db.SchoolYear,
                                    as: "schoolYear",
                                    attributes: ["year"],
                                    where: { active: true },
                                    required: false,
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!user) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseUserItem(user);
    }

    static async deleteUserByIds(ids, account) {
        /* 
            Kiểm tra phiếu mượn
        */
        const whereCondition = { active: true, schoolId: account.schoolId };

        const userHasLoanReceipt = await db.User.findAll({
            where: { ...whereCondition, id: { [Op.in]: ids } },
            attributes: ["id"],
            include: [
                {
                    model: db.LoanReceipt,
                    as: "loanReceiptList",
                    attributes: ["id"],
                    where: whereCondition,
                    required: true,
                },
            ],
        });

        if (userHasLoanReceipt.length > 0)
            throw new CatchException("Không thể xóa bạn đọc này!", errorCodes.DATA_IS_BINDING, {
                field: "ids",
                ids: userHasLoanReceipt.map((user) => user.id),
            });

        await db.User.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, ...whereCondition } }
        );
    }

    static async generateReaderCode(schoolId) {
        const { dataValues: highestReader } = (await db.User.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("readerCode")), "maxReaderCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newUserCode = "BD0001";

        if (highestReader && highestReader?.maxReaderCode) {
            const currentNumber = parseInt(highestReader.maxReaderCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newUserCode = `BD${nextNumber.toString().padStart(4, "0")}`;
        }

        return newUserCode;
    }
}

module.exports = UserService;
