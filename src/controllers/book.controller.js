const { transformer, convertToIntArray } = require("../../utils/server");
const BookService = require("../services/book.service");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");
const { checkIsDuplicates } = require("../../utils/customer-validate");

class BookController {
    static async getBookGroups(req) {
        return transformer(await BookService.getBookGroups(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getBookGroupById(req) {
        const { id } = req.params;

        return transformer(await BookService.getBookGroupById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async getBookByCode(req) {
        const { code } = req.params;

        return transformer(await BookService.getBookByCode(code, req.account), "Lấy chi tiết thành công.");
    }

    static async createBook(req) {
        const photoURL = req.files?.photoFile?.[0]?.path;
        const attachFiles = req.files?.attachFiles;
        const fieldIds = convertToIntArray(req.body.fieldIds) || [];

        if (checkIsDuplicates(fieldIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "fieldIds",
            });
        }

        return transformer(
            await BookService.createBook({ ...req.body, fieldIds, photoURL, attachFiles }, req.account),
            "Đã thêm dữ liệu sách mới."
        );
    }

    static async updateBookGroupById(req) {
        const { id } = req.params;
        const photoURL = req.files?.photoFile?.[0]?.path;
        const attachFiles = req.files?.attachFiles;
        const fieldIds = convertToIntArray(req.body.fieldIds) || [];

        if (checkIsDuplicates(fieldIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "fieldIds",
            });
        }

        return transformer(
            await BookService.updateBookGroupById({ ...req.body, photoURL, fieldIds, id, attachFiles }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteBookGroupByIds(req) {
        const { ids } = req.body;

        return transformer(await BookService.deleteBookGroupByIds(ids, req.account), "Cập nhật thành công.");
    }

    static async createBookCode(req) {
        return transformer(await BookService.createBookCode(req.body, req.account), "Dữ liệu mã sách mới đã được tạo.");
    }
}

module.exports = BookController;
