const { transformer, convertDate } = require("../../utils/server");
const BookRequestService = require("../services/bookRequest.service");
const db = require("../models");
const { errorCodes } = require("../../enums/error-code");
const { isDate } = require("../../utils/customer-validate");
const { CatchException } = require("../../utils/api-error");

class BookRequestController {
    static async getBookRequests(req) {
        return transformer(
            await BookRequestService.getBookRequests(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }

    static async getBookRequestByIdOrCode(req) {
        const { keyword } = req.params;

        return transformer(
            await BookRequestService.getBookRequestByIdOrCode(keyword, req.account),
            "Lấy chi tiết thành công."
        );
    }

    static async createBookRequest(req) {
        const { schoolId } = req.account;
        const photoURL = req.file?.path;
        let { requestDate } = req.body;
        const book = await db.BookRequest.build({ ...req.body, schoolId });

        await book.validate();

        if (!isDate(requestDate) && requestDate) {
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ.", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "requestDate",
            });
        }

        requestDate = convertDate(requestDate);

        return transformer(
            await BookRequestService.createBookRequest({ ...req.body, requestDate, photoURL }, req.account),
            "Đã thêm dữ liệu sách mới."
        );
    }

    static async updateBookRequestById(req) {
        const { schoolId } = req.account;
        const { id } = req.params;
        const newPhotoURL = req.file?.path;
        const bookRequest = await db.BookRequest.build({ ...req.body, schoolId, id });
        let { requestDate } = req.body;

        await bookRequest.validate();

        if (!isDate(requestDate) && requestDate) {
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ.", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "requestDate",
            });
        }

        requestDate = convertDate(requestDate);

        return transformer(
            await BookRequestService.updateBookRequestById({ ...req.body, newPhotoURL, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteBookRequestByIds(req) {
        const { ids } = req.body;

        return transformer(await BookRequestService.deleteBookRequestByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = BookRequestController;
