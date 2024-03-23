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

    static async createField(req) {
        return transformer(await FieldService.createField(req.body, req.account), "Dữ liệu lĩnh vực mới đã được tạo.");
    }

    static async updateFieldById(req) {
        const { id } = req.params;
        return transformer(
            await FieldService.updateFieldById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteFieldByIds(req) {
        const ids = req.body?.ids;
        return transformer(await FieldService.deleteFieldByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = FieldController;
