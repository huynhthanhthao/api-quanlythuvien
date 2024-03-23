const { transformer } = require("../../utils/server");
const LanguageService = require("../services/language.service");
const db = require("../models");

class LanguageController {
    static async getLanguages(req) {
        return transformer(await LanguageService.getLanguages(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getLanguageById(req) {
        const { id } = req.params;

        return transformer(await LanguageService.getLanguageById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createLanguage(req) {
        return transformer(
            await LanguageService.createLanguage(req.body, req.account),
            "Dữ liệu ngôn ngữ mới đã được tạo."
        );
    }

    static async updateLanguageById(req) {
        const { id } = req.params;
        return transformer(
            await LanguageService.updateLanguageById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteLanguageByIds(req) {
        const ids = req.body?.ids;
        return transformer(await LanguageService.deleteLanguageByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = LanguageController;
