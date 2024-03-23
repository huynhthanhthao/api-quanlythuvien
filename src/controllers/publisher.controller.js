const { transformer } = require("../../utils/server");
const Publisher = require("../services/publisher.service");
const db = require("../models");

class PublisherController {
    static async getPublishers(req) {
        return transformer(await Publisher.getPublishers(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getPublisherById(req) {
        const { id } = req.params;

        return transformer(await Publisher.getPublisherById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createPublisher(req) {
        return transformer(
            await Publisher.createPublisher(req.body, req.account),
            "Dữ liệu nhà xuất bản mới đã được tạo."
        );
    }

    static async updatePublisherById(req) {
        const { id } = req.params;
        return transformer(
            await Publisher.updatePublisherById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deletePublisherByIds(req) {
        const ids = req.body?.ids;
        return transformer(await Publisher.deletePublisherByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = PublisherController;
