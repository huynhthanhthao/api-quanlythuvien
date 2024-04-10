const { CatchException } = require("../../utils/api-error");
const db = require("../models");

class RoleService {
    static async createRole(newRole, account) {
        await db.Role.create({ ...newRole, createdBy: account.id, updatedBy: account.id });
    }
}

module.exports = RoleService;
