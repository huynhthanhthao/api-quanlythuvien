const { transformer } = require("../../utils/server");
const PermissionService = require("../services/permission.service");

class PermissionController {
    static async createPermission(req) {
        return transformer(
            await PermissionService.createPermission(req.body, req.account),
            "Đã thêm dữ liệu nhóm quyền mới."
        );
    }

    static async updatePermission(req) {
        const { id } = req.params;
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
        return transformer(
            await PermissionService.getPermissionById(req.query, req.account),
            "Lấy chi tiết thành công."
        );
    }
}

module.exports = PermissionController;
