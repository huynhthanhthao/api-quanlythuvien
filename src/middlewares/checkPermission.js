const { CatchException } = require("../../utils/api-error");

const db = require("../models");
const { Op } = require("sequelize");
const HttpStatus = require("http-status-codes");

const { ACCOUNT_STATUS } = require("../../enums");
const { errorMessages } = require("../../enums/error-messages");

async function checkPermission(req, permission) {
    // check permission with role

    const hadPermission = await db.RoleHasPermission.findOne({
        where: { isDeleted: false, roleId: req.user.roleId },
        include: [
            {
                model: db.Permission,
                as: "permission",
                where: { isDeleted: false, permissionCode: { [Op.like]: permission } },
                required: true,
            },
        ],
    });

    const isBlocked = await db.User.findOne({
        where: {
            [Op.or]: [
                { id: req.user.id, status: ACCOUNT_STATUS.BLOCKED },
                { id: req.user.id, isDeleted: true },
            ],
        },
    });

    if (!hadPermission || isBlocked) throw new CatchException("Không có quyền truy cập!", errorMessages.FORBIDDEN);
}

module.exports = checkPermission;
