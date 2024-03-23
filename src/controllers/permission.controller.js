const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const { checkIsDuplicates } = require("../../utils/customer-validate");
const { transformer } = require("../../utils/server");
const db = require("../models");
const PermissionService = require("../services/permission.service");

class PermissionController {
    static async createPermission(req) {
        const roleIds = req.body?.roleIds || [];

        if (checkIsDuplicates(roleIds)) {
            throw new CatchException("Dữ liệu bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "roleIds",
            });
        }

        return transformer(
            await PermissionService.createPermission(req.body, req.account),
            "Đã thêm dữ liệu nhóm quyền mới."
        );
    }

    static async updatePermission(req) {
        const { id } = req.params;

        const roleIds = req.body?.roleIds || [];

        if (checkIsDuplicates(roleIds)) {
            throw new CatchException("Dữ liệu bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "roleIds",
            });
        }

        return transformer(
            await PermissionService.updatePermission({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deletePermissionByIds(req) {
        const { ids } = req.body || [];
        return transformer(await PermissionService.deletePermissionByIds(ids, req.account), "Cập nhật thành công.");
    }

    static async getPermissions(req) {
        return transformer(await PermissionService.getPermissions(req.query, req.account), "Lấy chi tiết thành công.");
    }

    static async getPermissionById(req) {
        const { id } = req.params;
        return transformer(await PermissionService.getPermissionById(id, req.account), "Lấy chi tiết thành công.");
    }
}

module.exports = PermissionController;
