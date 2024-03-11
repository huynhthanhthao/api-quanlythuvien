const { transformer } = require("../../utils/server");
const BookStatusService = require("../services/bookStatus.service");
const db = require("../models");

class BookStatusController {
    static async getBookStatuses(req) {
        return transformer(
            await BookStatusService.getBookStatuses(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }

    static async getBookStatusById(req) {
        const { id } = req.params;

        return transformer(await BookStatusService.getBookStatusById(id, req.account), "Lấy chi tiết thành công.");
    }
}

module.exports = BookStatusController;
