const { transformer, convertToIntArray } = require("../../utils/server");
const BookService = require("../services/book.service");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");
const { checkIsDuplicates } = require("../../utils/customer-validate");

class BookController {
    static async getBooks(req) {
        return transformer(await BookService.getBooks(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getBookByIdOrCode(req) {
        const { keyword } = req.params;
        const type = req.query?.type || 0;

        return transformer(
            await BookService.getBookByIdOrCode({ keyword, type }, req.account),
            "Lấy chi tiết thành công."
        );
    }

    static async createBook(req) {
        const photoURL = req.file?.path;
        const fieldIds = convertToIntArray(req.body.fieldIds) || [];

        if (checkIsDuplicates(fieldIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "fieldIds",
            });
        }

        return transformer(
            await BookService.createBook({ ...req.body, fieldIds, photoURL }, req.account),
            "Đã thêm dữ liệu sách mới."
        );
    }

    static async updateBookById(req) {
        const { id } = req.params;
        const newPhotoURL = req.file?.path;
        const fieldIds = convertToIntArray(req.body.fieldIds) || [];

        if (checkIsDuplicates(fieldIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "fieldIds",
            });
        }

        return transformer(
            await BookService.updateBookById({ ...req.body, newPhotoURL, fieldIds, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteBookByIds(req) {
        const { ids } = req.body;

        return transformer(await BookService.deleteBookByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = BookController;
