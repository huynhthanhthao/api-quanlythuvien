const { transformer } = require("../../utils/server");
const PublisherService = require("../services/publisher.service");
const db = require("../models");

class PublisherController {
    static async getPublishers(req) {
        return transformer(await PublisherService.getPublishers(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getPublisherById(req) {
        const { id } = req.params;

        return transformer(await PublisherService.getPublisherById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createPublisher(req) {
        return transformer(
            await PublisherService.createPublisher(req.body, req.account),
            "Dữ liệu nhà xuất bản mới đã được tạo."
        );
    }

    static async updatePublisherById(req) {
        const { id } = req.params;
        return transformer(
            await PublisherService.updatePublisherById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deletePublisherByIds(req) {
        const ids = req.body?.ids;
        return transformer(await PublisherService.deletePublisherByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = PublisherController;
