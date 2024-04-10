const { transformer } = require("../../utils/server");
const RoleService = require("../services/role.service");

class RoleController {
    static async createRole(req) {
        return transformer(await RoleService.createRole(req.body, req.account), "Tạo chức năng thành công.");
    }
}

module.exports = RoleController;
