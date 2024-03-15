const db = require("../models");
const bcrypt = require("bcryptjs");
const { flattenObject, convertToIntArray } = require("../../utils/server");
const { bulkUpdate, getPagination } = require("../../utils/customer-sequelize");
const { Op } = require("sequelize");
const { UNLIMITED, DEFAULT_LIMIT } = require("../../enums/common");
const unidecode = require("unidecode");
const { mapResponseAccountList, mapResponseAccountItem } = require("../map-responses/account.map-response");

class AccountService {
    static async createAccount(newAccount, account) {
        const hashedPassword = await bcrypt.hash(newAccount.password, 10);

        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const accountCreated = await db.Account.create(
                {
                    password: hashedPassword,
                    username: newAccount.username,
                    status: newAccount.status,
                    permissionId: newAccount.permissionId,
                    userId: newAccount.userId,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                },
                { transaction }
            );

            const roleIds = newAccount.roleIds || [];

            await db.AccountHasRole.bulkCreate(
                roleIds.map((roleId) => ({
                    roleId,
                    accountId: accountCreated.id,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                })),
                { transaction }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateAccountById(updateAccount, account) {
        let transaction;
        const whereCondition = { active: true, schoolId: account.schoolId };
        try {
            transaction = await db.sequelize.transaction();

            await db.Account.update(
                {
                    id: updateAccount.id,
                    password: updateAccount.password ? await bcrypt.hash(updateAccount.password, 10) : undefined,
                    username: updateAccount.username,
                    status: updateAccount.status,
                    permissionId: updateAccount.permissionId,
                    userId: updateAccount.userId,
                    schoolId: account.schoolId,
                    updatedBy: account.id,
                },
                { where: { id: updateAccount.id, ...whereCondition }, transaction }
            );

            const roleIds = updateAccount.roleIds || [];

            const accountRoleData =
                roleIds.map((roleId) => ({
                    roleId,
                    accountId: updateAccount.id,
                    schoolId: account.schoolId,
                    createdBy: account.id,
                    updatedBy: account.id,
                })) || {};

            await bulkUpdate(
                accountRoleData,
                db.AccountHasRole,
                { accountId: updateAccount.id, schoolId: account.schoolId },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deleteAccountByIds(ids, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        await db.Account.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, ...whereCondition } }
        );

        await db.AccountHasRole.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { accountId: { [Op.in]: ids }, ...whereCondition } }
        );
    }

    static async getAccounts(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const statusIds = query.statusIds ? convertToIntArray(query.statusIds) : [];
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["username"];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const whereAccountCondition = {
            [Op.and]: [
                keyword && {
                    [Op.or]: [
                        ...searchableFields.map((field) =>
                            db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                                [Op.iLike]: `%${unidecode(keyword)}%`,
                            })
                        ),
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col("user.fullName")), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        }),
                    ],
                },
                query.statusIds && { status: { [Op.in]: statusIds } },
                { active: true },
                { schoolId: account.schoolId },
            ].filter(Boolean),
        };

        const whereCondition = { active: true, schoolId: account.schoolId };

        const { rows, count } = await db.Account.findAndCountAll({
            where: whereAccountCondition,
            limit,
            offset,
            attributes: ["id", "username", "status", "createdAt", "updatedAt"],
            include: [
                {
                    model: db.User,
                    as: "user",
                    where: whereCondition,
                    required: false,
                    attributes: ["id", "fullName", "photoURL", "phone", "birthday", "email"],
                },
                {
                    model: db.Permission,
                    as: "permission",
                    where: whereCondition,
                    required: false,
                    attributes: ["perName"],
                },
                {
                    model: db.AccountHasRole,
                    as: "accountHasRole",
                    where: whereCondition,
                    required: false,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Role,
                            as: "role",
                            where: { active: true },
                            required: false,
                            attributes: ["id", "roleName", "roleCode"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: mapResponseAccountList(rows),
        };
    }

    static async getAccountById(id, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const data = await db.Account.findOne({
            where: { ...whereCondition, id },
            attributes: ["id", "username", "status", "createdAt", "updatedAt"],
            include: [
                {
                    model: db.User,
                    as: "user",
                    where: whereCondition,
                    required: false,
                    attributes: ["id", "fullName", "photoURL", "phone", "birthday", "email"],
                },
                {
                    model: db.Permission,
                    as: "permission",
                    where: whereCondition,
                    required: false,
                    attributes: ["perName"],
                },
                {
                    model: db.AccountHasRole,
                    as: "accountHasRole",
                    where: whereCondition,
                    required: false,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Role,
                            as: "role",
                            where: { active: true },
                            required: false,
                            attributes: ["id", "roleName", "roleCode"],
                        },
                    ],
                },
            ],
        });

        if (!data) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);
        return mapResponseAccountItem(data);
    }

    static async getByUsernameAndSchoolId(params) {
        const trimmedUsername = (params.username || "").trim();
        const schoolId = params.schoolId || 0;

        const account = await db.Account.findOne({
            where: { username: trimmedUsername, schoolId, active: true },
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
            ],
        });

        return mapResponseAccountItem(account);
    }

    static async getRoleSchoolId(schoolId) {
        const account = await db.Account.findOne({
            where: { id: schoolId, active: true },
            attributes: ["id", "schoolId"],
        });

        return account;
    }
}

module.exports = AccountService;
