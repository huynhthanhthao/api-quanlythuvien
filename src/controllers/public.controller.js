const { transformer } = require("../../utils/server");
const BookService = require("../services/book.service");

class PublicController {
    static async getBooks(req) {
        const schoolId = req.query.schoolId || 0;
        return transformer(await BookService.getBooks(req.query, { schoolId }), "Lấy danh sách thành công.");
    }

    static async getBookByIdOrCode(req) {
        const { keyword } = req.params;
        const type = req.query?.type || 0;
        const schoolId = req.query.schoolId || 0;

        return transformer(
            await BookService.getBookByIdOrCode({ keyword, type }, { schoolId }),
            "Lấy chi tiết thành công."
        );
    }
}

module.exports = PublicController;
