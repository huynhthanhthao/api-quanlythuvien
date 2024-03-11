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
}

module.exports = PublisherController;
