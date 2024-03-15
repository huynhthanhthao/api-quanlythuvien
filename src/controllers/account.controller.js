const { errorCodes } = require("../../enums/error-code");
const { checkIsDuplicates } = require("../../utils/customer-validate");
const { transformer } = require("../../utils/server");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const AccountService = require("../services/account.service");

class AccountController {
    static async createAccount(req) {
        const { schoolId } = req.account;
        const roleIds = req.body?.roleIds || [];

        if (checkIsDuplicates(roleIds)) {
            throw new CatchException("Dữ liệu bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "roleIds",
            });
        }

        const account = await db.Account.build({ ...req.body, schoolId });

        await account.validate();

        return transformer(await AccountService.createAccount(req.body, req.account), "Tạo tài khoản thành công.");
    }

    static async updateAccountById(req) {
        const { schoolId } = req.account;
        const { id } = req.params;

        const roleIds = req.body?.roleIds || [];

        if (checkIsDuplicates(roleIds)) {
            throw new CatchException("Dữ liệu bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "roleIds",
            });
        }

        const account = await db.Account.build({ ...req.body, id, schoolId });

        await account.validate({ fields: ["username", "permissionId", "status"] });

        return transformer(
            await AccountService.updateAccountById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteAccountByIds(req) {
        const { ids } = req.body;

        return transformer(await AccountService.deleteAccountByIds(ids, req.account), "Cập nhật thành công.");
    }

    static async getAccounts(req) {
        return transformer(await AccountService.getAccounts(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getAccountById(req) {
        const { id } = req.params;

        return transformer(await AccountService.getAccountById(id, req.account), "Lấy chi tiết thành công.");
    }
}

module.exports = AccountController;
