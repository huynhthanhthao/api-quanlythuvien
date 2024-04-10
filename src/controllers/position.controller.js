const { transformer } = require("../../utils/server");
const PositionService = require("../services/position.service");
const db = require("../models");

class PositionController {
    static async getPositions(req) {
        return transformer(await PositionService.getPositions(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getPositionById(req) {
        const { id } = req.params;

        return transformer(await PositionService.getPositionById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createPosition(req) {
        return transformer(await PositionService.createPosition(req.body, req.account), "Đã thêm dữ liệu kệ sách mới.");
    }

    static async updatePositionById(req) {
        const { id } = req.params;
        return transformer(
            await PositionService.updatePositionById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deletePositionByIds(req) {
        const { ids } = req.body;

        return transformer(await PositionService.deletePositionByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = PositionController;
