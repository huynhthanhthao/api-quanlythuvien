const { transformer } = require("../../utils/server");
const AuthService = require("../services/auth.service");

class AuthController {
    static async login(req) {
        return transformer(await AuthService.login(req.body), "Đăng nhập thành công.");
    }
}

module.exports = AuthController;
