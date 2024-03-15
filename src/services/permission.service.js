const { Op } = require("sequelize");
const db = require("../models");
const unidecode = require("unidecode");
const { CatchException } = require("../../utils/api-error");
const { bulkUpdate, getPagination } = require("../../utils/customer-sequelize");
const { DEFAULT_LIMIT, UNLIMITED } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { mapResponsePermissionList, mapResponsePermissionItem } = require("../map-responses/permission.map-response");

class PermissionService {
    static async createPermission(newPermission, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const permission = await db.Permission.create(
                {
                    ...newPermission,
                    schoolId: account.schoolId,
                    createdBy: account.schoolId,
                    updatedBy: account.schoolId,
                },
                { transaction }
            );

            const roleIds = newPermission.roleIds || [];

            await db.PermissionHasRole.bulkCreate(
                roleIds.map((roleId) => ({
                    permissionId: permission.id,
                    roleId: roleId,
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

    static async updatePermission(updatePermission, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const whereCondition = { active: true, schoolId: account.schoolId };

            await db.Permission.update(
                {
                    schoolId: account.schoolId,
                    createdBy: account.schoolId,
                    updatedBy: account.schoolId,
                },
                { where: { ...whereCondition, id: updatePermission.id }, transaction }
            );

            const roleIds = updatePermission.roleIds || [];

            const perHasRoleData = roleIds.map((roleId) => ({
                roleId,
                permissionId: updatePermission.id,
                roleId: roleId,
                schoolId: account.schoolId,
                updatedBy: account.id,
                createdBy: account.id,
            }));

            await bulkUpdate(
                perHasRoleData,
                db.PermissionHasRole,
                { permissionId: updatePermission.id, schoolId: account.schoolId },
                account,
                transaction
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deletePermissionByIds(ids, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        await db.Permission.update(
            { active: false, updatedBy: account.id },
            { where: { ...whereCondition, id: { [Op.in]: ids } } }
        );

        await db.PermissionHasRole.update(
            { active: false, updatedBy: account.id },
            { where: { ...whereCondition, permissionId: { [Op.in]: ids } } }
        );
    }

    static async getPermissions(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["perName"];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const wherePermissionCondition = {
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

        const whereCondition = { active: true, schoolId: account.schoolId };

        const { rows, count } = await db.Permission.findAndCountAll({
            where: wherePermissionCondition,
            limit,
            offset,
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.PermissionHasRole,
                    as: "permissionHasRole",
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
            list: mapResponsePermissionList(rows),
        };
    }

    static async getPermissionById(id, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const permission = await db.Permission.findOne({
            where: { id, ...whereCondition },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.PermissionHasRole,
                    as: "permissionHasRole",
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

        if (!permission) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponsePermissionItem(permission);
    }
}

module.exports = PermissionService;
