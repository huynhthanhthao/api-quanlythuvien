const { transformer } = require("../../utils/server");
const AccountService = require("../services/account.service");

class AccountController {
    static async createAccount(req) {
        return transformer(await AccountService.createAccount(req.body, req.account), "Tạo tài khoản thành công.");
    }
}

module.exports = AccountController;
