const { CatchException } = require("../../utils/api-error");

const db = require("../models");
const { errorCodes } = require("../../enums/error-code");

function checkPermission(roleCode) {
    return async function (req, res, next) {
        try {
            const { id: accountId, schoolId, permissionId } = req.account;
            const whereCondition = { active: true, schoolId };

            const [roleInPermission, roleInAccount] = await Promise.all([
                db.Role.findOne({
                    where: { active: true, roleCode: roleCode?.trim() },
                    attributes: ["id"],
                    include: [
                        {
                            model: db.PermissionHasRole,
                            as: "permissionHasRole",
                            where: { ...whereCondition, permissionId },
                            required: true,
                            attributes: ["id"],
                        },
                    ],
                }),
                db.Role.findOne({
                    where: { active: true, roleCode: roleCode?.trim() },
                    attributes: ["id"],
                    include: [
                        {
                            model: db.AccountHasRole,
                            as: "accountHasRole",
                            where: { ...whereCondition, accountId },
                            required: true,
                            attributes: ["id"],
                        },
                    ],
                }),
            ]);

            if (roleInPermission || roleInAccount) {
                next();
            } else {
                throw new CatchException("Không có quyền truy cập!", errorCodes.FORBIDDEN);
            }
        } catch (error) {
            next(error);
        }
    };
}

module.exports = checkPermission;
