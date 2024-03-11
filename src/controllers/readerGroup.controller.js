const { transformer } = require("../../utils/server");
const ReaderGroupService = require("../services/readerGroup.service");

class ReaderGroupController {
    static async getReaderGroups(req) {
        return transformer(
            await ReaderGroupService.getReaderGroups(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }
}

module.exports = ReaderGroupController;
