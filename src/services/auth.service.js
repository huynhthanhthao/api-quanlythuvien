const { CatchException } = require("../../utils/api-error");
const HttpStatus = require("http-status-codes");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const AccountService = require("./account.service");
const { errorCodes } = require("../../enums/error-code");
const { ACCOUNT_STATUS } = require("../../enums/common");

class AuthService {
    static async login(account) {
        const accountExisted = await AccountService.getByUsernameAndSchoolId(account);

        const passwordValid = await bcrypt.compare(account.password || "", accountExisted?.password || "");

        if (!accountExisted || !passwordValid)
            throw new CatchException("Tài khoản hoặc mật khẩu không chính xác!", errorCodes.INCORRECT_CREDENTIAL);

        if (accountExisted.status == ACCOUNT_STATUS.BLOCKED)
            throw new CatchException("Tài khoản đã bị khóa!", errorCodes.ACCOUNT_LOCKED);

        const token = jwt.sign({ id: accountExisted.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "48h" });

        delete accountExisted.password;

        return { token, user: accountExisted };
    }
}

module.exports = AuthService;
