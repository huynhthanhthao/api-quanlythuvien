const { CatchException } = require("../../utils/api-error");
const db = require("../models");

class GroupRoleService {
    static async createGroupRole(newGroupRole, account) {
        await db.GroupRole.create({ ...newGroupRole, createdBy: account.id, updatedBy: account.id });
    }

    static async getGroupRoles(query, account) {
        const groupRole = await db.GroupRole.findAll({
            where: { active: true },
            attributes: ["id", "groupName"],
            include: [
                {
                    model: db.Role,
                    as: "roleList",
                    where: { active: true },
                    attributes: ["id", "roleName", "roleCode"],
                },
            ],
        });

        return groupRole;
    }
}

module.exports = GroupRoleService;
