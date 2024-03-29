const { transformer, convertToIntArray } = require("../../utils/server");
const BookService = require("../services/book.service");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");
const { checkIsDuplicates } = require("../../utils/customer-validate");
const { QUERY_ONE_TYPE } = require("../../enums/common");

class BookController {
    static async getBooks(req) {
        return transformer(await BookService.getBooks(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getBookGroupById(req) {
        const { id } = req.params;

        return transformer(await BookService.getBookGroupById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createBook(req) {
        const photoURL = req.files?.photoFile?.[0]?.path;
        const attachFiles = req.files?.attachFiles;
        const fieldIds = convertToIntArray(req.body.fieldIds) || [];
        const detailBooks = JSON.parse(req.body.detailBooks || []) || [];

        if (checkIsDuplicates(fieldIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "fieldIds",
            });
        }

        return transformer(
            await BookService.createBook({ ...req.body, fieldIds, photoURL, attachFiles, detailBooks }, req.account),
            "Đã thêm dữ liệu sách mới."
        );
    }

    static async updateBookById(req) {
        const { id } = req.params;
        const photoURL = req.files?.photoFile?.[0]?.path;
        const attachFiles = req.files?.attachFiles;
        const fieldIds = convertToIntArray(req.body.fieldIds) || [];
        const detailBooks = JSON.parse(req.body.detailBooks || []) || [];

        if (checkIsDuplicates(fieldIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "fieldIds",
            });
        }

        return transformer(
            await BookService.updateBookById(
                { ...req.body, photoURL, fieldIds, id, attachFiles, detailBooks },
                req.account
            ),
            "Cập nhật thành công."
        );
    }

    static async deleteBookByIds(req) {
        const { ids } = req.body;

        return transformer(await BookService.deleteBookByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = BookController;
