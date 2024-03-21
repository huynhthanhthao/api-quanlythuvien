const { errorCodes } = require("../../enums/error-code");
const { checkIsDuplicates } = require("../../utils/customer-validate");
const { transformer } = require("../../utils/server");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const AccountService = require("../services/account.service");

class AccountController {
    static async createAccount(req) {
        const roleIds = req.body?.roleIds || [];
        const password = req.body?.password || "";
        const permissionId = req.body?.permissionId;
        const { schoolId } = req.account;

        if (!password || password.length < 6) {
            throw new CatchException("Mật khẩu phải trên 6 kí tự!", errorCodes.INVALID_DATA, {
                field: "password",
            });
        }

        let roleIdsInPermission = [];

        if (permissionId) {
            const rolesInPermission = await db.Permission.findOne({
                where: { active: true, schoolId, id: permissionId },
                attributes: ["id"],
                include: [
                    {
                        model: db.PermissionHasRole,
                        as: "permissionHasRole",
                        where: { active: true, schoolId },
                        required: false,
                        attributes: ["id", "roleId"],
                    },
                ],
            });

            roleIdsInPermission = rolesInPermission?.permissionHasRole?.map((item) => +item.roleId);
        }

        if (checkIsDuplicates([...roleIds, ...roleIdsInPermission])) {
            throw new CatchException("Dữ liệu bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "roleIds",
            });
        }

        return transformer(await AccountService.createAccount(req.body, req.account), "Tạo tài khoản thành công.");
    }

    static async updateAccountById(req) {
        const { id } = req.params;
        const { schoolId } = req.account;
        const permissionId = req.body?.permissionId;
        const roleIds = req.body?.roleIds || [];

        let roleIdsInPermission = [];

        if (permissionId) {
            const rolesInPermission = await db.Permission.findOne({
                where: { active: true, schoolId, id: permissionId },
                attributes: ["id"],
                include: [
                    {
                        model: db.PermissionHasRole,
                        as: "permissionHasRole",
                        where: { active: true, schoolId },
                        required: false,
                        attributes: ["id", "roleId"],
                    },
                ],
            });

            roleIdsInPermission = rolesInPermission?.permissionHasRole?.map((item) => +item.roleId);
        }

        if (checkIsDuplicates([...roleIds, ...roleIdsInPermission])) {
            throw new CatchException("Dữ liệu bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "roleIds",
            });
        }

        return transformer(
            await AccountService.updateAccountById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteAccountByIds(req) {
        const { ids } = req.body;

        return transformer(await AccountService.deleteAccountByIds(ids, req.account), "Cập nhật thành công.");
    }

    static async getAccounts(req) {
        return transformer(await AccountService.getAccounts(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getAccountById(req) {
        const { id } = req.params;

        return transformer(await AccountService.getAccountById(id, req.account), "Lấy chi tiết thành công.");
    }
}

module.exports = AccountController;
