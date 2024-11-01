const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const {
    DEFAULT_LIMIT,
    UNLIMITED,
    USER_TYPE,
    ACTIVITY_TYPE,
    QUERY_ONE_TYPE,
    ACCOUNT_STATUS,
} = require("../../enums/common");
const { convertToIntArray, getStartOfDay, getPhotoURLFromLink, convertDate } = require("../../utils/server");
const { mapResponseUserList, mapResponseUserItem } = require("../map-responses/user.map-response");
const { TABLE_NAME } = require("../../enums/languages");
const { errorCodes } = require("../../enums/error-code");
const { getPagination } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { CatchException } = require("../../utils/api-error");
const { isBirthday, isDate } = require("../../utils/customer-validate");
const jwt = require("jsonwebtoken");
const AccountService = require("./account.service");
const { mapResponseAccountItem } = require("../map-responses/account.map-response");
class UserService {
    static async createUser(newUser, account) {
        let transaction;
        const type = newUser.type || USER_TYPE.READER;
        try {
            transaction = await db.sequelize.transaction();

            const readerCode = await this.generateUserCode(account.schoolId);

            const user = await db.User.create(
                {
                    ...newUser,
                    photoURL: newUser.photoURL ? getPhotoURLFromLink(newUser.photoURL) : newUser.newPhotoURL,
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

            if (type == USER_TYPE.READER) {
                if (!newUser.effectiveTime)
                    throw new CatchException("Thời gian hiệu lực không được để trống!", errorCodes.MISSING_DATA, {
                        field: "effectiveTime",
                    });

                await this.createEffectReader(+newUser.effectiveTime, user.id, account, transaction);
            }

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

    static async createUserFromExcel(dataCreate, account) {
        const validData = [];
        const errorData = [];

        dataCreate = dataCreate.map((data) => ({
            ...data,
            type: USER_TYPE.READER,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        }));

        for (let index = 0; index < dataCreate.length; index++) {
            const data = dataCreate[index];
            let transaction;
            try {
                transaction = await db.sequelize.transaction();
                let { birthday, cardDate } = data;

                if (!isDate(cardDate) && cardDate) {
                    throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ.", errorCodes.DATA_INCORRECT_FORMAT, {
                        field: "cardDate",
                    });
                }

                if (!isBirthday(birthday))
                    throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ.", errorCodes.DATA_INCORRECT_FORMAT, {
                        field: "birthday",
                    });

                cardDate = convertDate(cardDate);
                birthday = convertDate(birthday);
                const readerCode = await this.generateUserCode(account.schoolId);

                const newUser = await db.User.create({ ...data, readerCode, cardDate, birthday });

                await db.ClassHasUser.create(
                    {
                        userId: newUser.id,
                        classId: data.classId,
                        schoolId: account.schoolId,
                        createdBy: account.id,
                        updatedBy: account.id,
                    },
                    { transaction }
                );

                await this.createEffectReader(+data.effectiveTime, newUser.id, account, transaction);

                await ActivityService.createActivity(
                    {
                        dataTarget: newUser.id,
                        tableTarget: TABLE_NAME.USER,
                        action: ACTIVITY_TYPE.CREATED,
                    },
                    account,
                    transaction
                );

                await transaction.commit();

                validData.push(data);
            } catch (error) {
                await transaction.rollback();
                errorData.push({
                    index: index,
                    data: data,
                });
            }
        }

        return {
            totalSuccess: validData.length,
            errorData,
        };
    }

    static async createEffectReader(effectiveTime, userId, account, transaction) {
        const startDay = new Date();
        const endDay = new Date();
        endDay.setMonth(startDay.getMonth() + effectiveTime);

        await db.UserHasEffect.create(
            {
                startDay,
                endDay,
                userId,
                createdBy: account.id,
                updatedBy: account.id,
                schoolId: account.schoolId,
            },
            { transaction }
        );
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
                    model: db.UserHasEffect,
                    as: "userHasEffect",
                    required: false,
                    where: whereCommonCondition,
                    attributes: ["id", "startDay", "endDay"],
                    order: [["createdAt", "DESC"]],
                    limit: 1,
                },
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
            whereCondition.readerCode = { [Op.iLike]: keyword?.trim() };
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
                    model: db.UserHasEffect,
                    as: "userHasEffect",
                    required: false,
                    where: whereCommonCondition,
                    attributes: ["id", "startDay", "endDay"],
                    order: [["createdAt", "DESC"]],
                    limit: 1,
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

    static async extendUser(userExtend, account) {
        if (!userExtend.effectiveTime)
            throw new CatchException("Thời gian hiệu lực không được để trống!", errorCodes.MISSING_DATA, {
                field: "effectiveTime",
            });

        const user = await db.User.findOne({
            where: { id: userExtend.id, active: true, schoolId: account.schoolId },
            attributes: ["id", "type"],
        });

        if (user.type != USER_TYPE.READER)
            throw new CatchException("Người dùng không phải là bạn đọc!", errorCodes.INVALID_DATA, {});

        await this.createEffectReader(+userExtend.effectiveTime, userExtend.id, account);
    }

    static async checkUserValidity(id, account, field) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const user = await db.User.findOne({
            where: { ...whereCondition, id },
            attributes: ["id"],
            include: [
                {
                    model: db.UserHasEffect,
                    as: "userHasEffect",
                    required: false,
                    where: whereCondition,
                    attributes: ["id", "startDay", "endDay"],
                    order: [["createdAt", "DESC"]],
                    limit: 1,
                },
            ],
        });

        const endDay = user.userHasEffect?.[0]?.endDay;

        if (endDay && getStartOfDay(endDay) / 1000 < getStartOfDay(new Date()) / 1000)
            throw new CatchException("Bạn đọc này đã hết hạn!", errorCodes.RESOURCE_HAS_EXPIRED, { field: field });
    }

    static async getUserByToken(token) {
        if (!token) {
            throw new CatchException("Không tìm thấy token!", errorCodes.TOKEN_NOT_FOUND);
        }

        let account = null;

        await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decode) => {
            if (err) {
                throw new CatchException("Token không hợp lệ!", errorCodes.INVALID_TOKEN);
            }

            account = await db.Account.findOne({
                where: { id: decode.id, active: true },
                attributes: ["id", "username", "password", "active", "status"],
                include: [
                    {
                        model: db.User,
                        as: "user",
                        required: false,
                        where: { active: true },
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                        },
                    },
                    {
                        model: db.AccountHasRole,
                        as: "accountHasRole",
                        where: { active: true },
                        required: false,
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Role,
                                as: "role",
                                required: false,
                                attributes: ["roleCode"],
                            },
                        ],
                    },
                    {
                        model: db.Permission,
                        as: "permission",
                        where: { active: true },
                        required: false,
                        attributes: ["perName", "id"],
                        include: [
                            {
                                model: db.PermissionHasRole,
                                as: "permissionHasRole",
                                where: { active: true },
                                required: false,
                                attributes: ["id"],
                                include: [
                                    {
                                        model: db.Role,
                                        as: "role",
                                        required: false,
                                        attributes: ["roleCode"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        return { token, user: mapResponseAccountItem(account) };
    }
}

module.exports = UserService;
