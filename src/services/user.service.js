const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const { DEFAULT_LIMIT, UNLIMITED, USER_TYPE, ACTIVITY_TYPE, QUERY_ONE_TYPE } = require("../../enums/common");
const { convertToIntArray } = require("../../utils/server");
const { mapResponseUserList, mapResponseUserItem } = require("../map-responses/user.map-response");
const { TABLE_NAME } = require("../../enums/languages");
const { errorCodes } = require("../../enums/error-code");
const { getPagination } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { CatchException } = require("../../utils/api-error");

class UserService {
    static async createUser(newUser, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const readerCode = await this.generateUserCode(account.schoolId);

            const user = await db.User.create(
                {
                    ...newUser,
                    photoURL: newUser.photoURL,
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

            await ActivityService.createActivity(
                {
                    dataTarget: user.id,
                    tableTarget: TABLE_NAME.USER,
                    action: ACTIVITY_TYPE.CREATED,
                },
                account,
                transaction
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
                    photoURL: updatePhotoURL,
                    schoolId: account.schoolId,
                    updatedBy: account.id,
                },
                { where: { id: updateUser.id, active: true, schoolId: account.schoolId } }
            );

            await this.updateUserClass(updateUser, account, transaction);

            await ActivityService.createActivity(
                {
                    dataTarget: updateUser.id,
                    tableTarget: TABLE_NAME.USER,
                    action: ACTIVITY_TYPE.UPDATED,
                },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateUserClass(updateUser, account, transaction) {
        const latestRecord = await db.ClassHasUser.findAll({
            where: { userId: updateUser.id, active: true, schoolId: account.schoolId },
            order: [["createdAt", "DESC"]],
            limit: 1,
            transaction: transaction,
        });

        if (latestRecord.length > 0) {
            await latestRecord[0].update(
                {
                    classId: updateUser.classId,
                    updatedBy: account.id,
                },
                { transaction: transaction }
            );
        } else {
            await db.ClassHasUser.create(
                {
                    userId: updateUser.id,
                    classId: updateUser.classId,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { transaction: transaction }
            );
        }

        if (!updateUser.classId) {
            await db.ClassHasUser.update(
                { active: false },
                {
                    where: { userId: updateUser.id, active: true, schoolId: account.schoolId },
                    transaction: transaction,
                }
            );
        }
    }

    static async getUsers(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const type = query.type || USER_TYPE.READER;
        const groupIds = query.groupIds ? convertToIntArray(query.groupIds) : [];
        const classIds = query.classIds ? convertToIntArray(query.classIds) : [];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableFields = ["fullName", "readerCode", "phone", "address", "email", "cardId"];

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
            type,
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
            [Op.and]: [
                classIds.length > 0 && { id: { [Op.in]: classIds } },
                { schoolId: account.schoolId },
                { active: true },
            ].filter(Boolean),
        };

        const whereCommonCondition = {
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
                    where: whereCommonCondition,
                    attributes: ["id", "groupName"],
                },
                {
                    model: db.ClassHasUser,
                    as: "classHasUser",
                    required: false,
                    attributes: ["userId", "createdAt"],
                    order: [["createdAt", "DESC"]],
                    where: whereCommonCondition,
                    include: [
                        {
                            model: db.Class,
                            as: "class",
                            required: classIds.length > 0 ? true : false,
                            attributes: ["id", "className"],
                            where: whereClassCondition,
                            include: [
                                {
                                    model: db.SchoolYear,
                                    as: "schoolYear",
                                    attributes: ["year"],
                                    required: false,
                                    where: whereCommonCondition,
                                },
                            ],
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

    static async getUserByIdOrCode(query, account) {
        const { keyword } = query;
        const type = query.type || QUERY_ONE_TYPE.ID;

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (type == QUERY_ONE_TYPE.CODE) {
            whereCondition.readerCode = { [Op.iLike]: keyword };
        } else {
            whereCondition.id = keyword;
        }

        const whereCommonCondition = {
            schoolId: account.schoolId,
            active: true,
        };

        const user = await db.User.findOne({
            where: whereCondition,
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.ReaderGroup,
                    as: "readerGroup",
                    where: whereCommonCondition,
                    required: false,
                    attributes: ["id", "groupName"],
                },
                {
                    model: db.ClassHasUser,
                    as: "classHasUser",
                    where: whereCommonCondition,
                    required: false,
                    attributes: ["userId", "createdAt"],
                    order: [["createdAt", "DESC"]],
                    include: [
                        {
                            model: db.Class,
                            as: "class",
                            attributes: ["id", "className"],
                            required: false,
                            where: whereCommonCondition,
                            include: [
                                {
                                    model: db.SchoolYear,
                                    as: "schoolYear",
                                    attributes: ["year"],
                                    where: whereCommonCondition,
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

        const borrowedUserIds = userHasLoanReceipt.map((user) => +user.id);

        const validUserIds = ids.filter((id) => !borrowedUserIds.includes(+id));

        await db.User.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: validUserIds }, ...whereCondition } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(validUserIds),
                tableTarget: TABLE_NAME.USER,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );

        if (userHasLoanReceipt.length > 0)
            throw new CatchException("Không thể xóa bạn đọc này!", errorCodes.DATA_IS_BINDING, {
                field: "ids",
                ids: borrowedUserIds,
            });
    }

    static async generateUserCode(schoolId, type) {
        const { dataValues: highestReader } = (await db.User.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("readerCode")), "maxReaderCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newUserCode = "ND0001";

        if (highestReader && highestReader?.maxReaderCode) {
            const currentNumber = parseInt(highestReader.maxReaderCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newUserCode = `ND${nextNumber.toString().padStart(4, "0")}`;
        }

        return newUserCode;
    }
}

module.exports = UserService;
