const { transformer } = require("../../utils/server");
const FieldService = require("../services/field.service");
const db = require("../models");

class FieldController {
    static async getFields(req) {
        return transformer(await FieldService.getFields(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getFieldById(req) {
        const { id } = req.params;

        return transformer(await FieldService.getFieldById(id, req.account), "Lấy chi tiết thành công.");
    }
}

module.exports = FieldController;
