const { transformer } = require("../../utils/server");
const Language = require("../services/language.service");
const db = require("../models");

class LanguageController {
    static async getLanguages(req) {
        return transformer(await Language.getLanguages(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getLanguageById(req) {
        const { id } = req.params;

        return transformer(await Language.getLanguageById(id, req.account), "Lấy chi tiết thành công.");
    }
}

module.exports = LanguageController;
