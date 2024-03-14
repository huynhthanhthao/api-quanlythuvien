const { CatchException } = require("../../utils/api-error");
const db = require("../models");

class PermissionService {
    static async createPermission(newPermission, account) {}

    static async updatePermission(Permission, account) {}

    static async deletePermissionByIds(ids, account) {}

    static async getPermissions(query, account) {}

    static async getPermissionById(id, account) {}
}

module.exports = PermissionService;
