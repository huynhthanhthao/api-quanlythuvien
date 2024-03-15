const HttpStatus = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { CatchException } = require("../../utils/api-error");
const AccountService = require("../services/account.service");
const { errorCodes } = require("../../enums/error-code");
const { ACCOUNT_STATUS } = require("../../enums/common");

function checkToken(req, res, next) {
    const authorization = req.headers.authorization;

    const token = authorization?.split(" ")[1];

    if (!token) {
        throw new CatchException("Không tìm thấy token!", errorCodes.TOKEN_NOT_FOUND);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decode) => {
        if (err) {
            throw new CatchException("Token không hợp lệ!", errorCodes.INVALID_TOKEN);
        }

        const account = await AccountService.getRoleSchoolId(decode.id);

        if (account.status == ACCOUNT_STATUS.BLOCKED)
            throw new CatchException("Tài khoản đã bị khóa!", errorCodes.FORBIDDEN);

        req.account = { id: decode.id, schoolId: account?.schoolId, permissionId: account.permissionId };

        next();
    }).catch((error) => {
        next(error);
    });
}

module.exports = checkToken;
