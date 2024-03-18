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

        return transformer(await BookService.getBookByIdOrCode(keyword, req.account), "Lấy chi tiết thành công.");
    }

    static async createBook(req) {
        const photoURL = req.file?.path;
        const fieldIds = convertToIntArray(req.body.fieldIds) || [];
        const detailQuantity = JSON.parse(req.body.detailQuantity || "[]") || [];

        // if (detailQuantity.length == 0) {
        //     throw new CatchException("Số lượng không được để trống.", errorCodes.MISSING_DATA, {
        //         field: "detailQuantity",
        //     });
        // }

        const statusIds = detailQuantity.map((book) => book.statusId);

        if (checkIsDuplicates(statusIds)) {
            throw new CatchException("Trạng thái bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "detailQuantity",
            });
        }

        // for (const detail of detailQuantity) {
        //     if (detail.quantity <= 0)
        //         throw new CatchException("Số lượng phải lớn hơn 0.", errorCodes.INVALID_DATA, {
        //             field: "quantity",
        //         });
        // }

        return transformer(
            await BookService.createBook({ ...req.body, fieldIds, photoURL, detailQuantity }, req.account),
            "Đã thêm dữ liệu sách mới."
        );
    }

    static async updateBookById(req) {
        const { id } = req.params;
        const newPhotoURL = req.file?.path;
        const fieldIds = convertToIntArray(req.body.fieldIds) || [];
        const detailQuantity = JSON.parse(req.body.detailQuantity || "[]") || [];

        const statusIds = detailQuantity.map((book) => book.statusId);

        if (checkIsDuplicates(statusIds)) {
            throw new CatchException("Trạng thái bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "detailQuantity",
            });
        }

        // for (const detail of detailQuantity) {
        //     if (detail.quantity <= 0)
        //         throw new CatchException("Số lượng phải lớn hơn 0.", errorCodes.INVALID_DATA, {
        //             field: "quantity",
        //         });
        // }

        return transformer(
            await BookService.updateBookById({ ...req.body, newPhotoURL, fieldIds, detailQuantity, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteBookByIds(req) {
        const { ids } = req.body;

        return transformer(await BookService.deleteBookByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = BookController;
