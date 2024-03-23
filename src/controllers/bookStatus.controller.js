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

    static async createBookStatus(req) {
        return transformer(
            await BookStatusService.createBookStatus(req.body, req.account),
            "Dữ liệu tình trạng sách mới đã được tạo."
        );
    }

    static async updateBookStatusById(req) {
        const { id } = req.params;
        return transformer(
            await BookStatusService.updateBookStatusById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteBookStatusByIds(req) {
        const ids = req.body?.ids;
        return transformer(await BookStatusService.deleteBookStatusByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = BookStatusController;
