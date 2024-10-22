const { transformer } = require("../../utils/server");
const GroupRoleService = require("../services/groupRole.service");

class GroupRoleController {
    static async createGroupRole(req) {
        return transformer(
            await GroupRoleService.createGroupRole(req.body, req.account),
            "Tạo nhóm chức năng thành công."
        );
    }

    static async getGroupRoles(req) {
        return transformer(
            await GroupRoleService.getGroupRoles(req.query, req.account),
            "Lấy nhóm chức năng thành công."
        );
    }
}

module.exports = GroupRoleController;
