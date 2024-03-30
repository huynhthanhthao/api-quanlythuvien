const { transformer } = require("../../utils/server");
const ReaderGroupService = require("../services/readerGroup.service");

class ReaderGroupController {
    static async getReaderGroups(req) {
        return transformer(
            await ReaderGroupService.getReaderGroups(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }

    static async getReaderGroupById(req) {
        const { id } = req.params;

        return transformer(await ReaderGroupService.getReaderGroupById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createReaderGroup(req) {
        return transformer(
            await ReaderGroupService.createReaderGroup(req.body, req.account),
            "Dữ liệu nhóm bán đọc mới đã được tạo."
        );
    }

    static async updateReaderGroupById(req) {
        const { id } = req.params;
        return transformer(
            await ReaderGroupService.updateReaderGroupById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteReaderGroupByIds(req) {
        const ids = req.body?.ids;
        return transformer(await ReaderGroupService.deleteReaderGroupByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = ReaderGroupController;
