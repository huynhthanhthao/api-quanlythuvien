const { CatchException } = require("../../utils/api-error");
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

    static async refreshToken(data) {
        const token = data.token || "";
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded) {
            throw new CatchException("Token không hợp lệ!", errorCodes.INVALID_TOKEN);
        }

        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "48h" });

        return { accessToken };
    }
}

module.exports = AuthService;
