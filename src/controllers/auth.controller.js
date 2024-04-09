const { transformer } = require("../../utils/server");
const AuthService = require("../services/auth.service");

class AuthController {
    static async login(req) {
        return transformer(await AuthService.login(req.body), "Đăng nhập thành công.");
    }

    static async refreshToken(req) {
        return transformer(await AuthService.refreshToken(req.body), "Refresh token thành công.");
    }
}

module.exports = AuthController;
