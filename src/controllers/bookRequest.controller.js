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
        const type = req.query?.type || 0;

        return transformer(
            await BookRequestService.getBookRequestByIdOrCode({ keyword, type }, req.account),
            "Lấy chi tiết thành công."
        );
    }

    static async createBookRequest(req) {
        const photoURL = req.file?.path;
        let { requestDate } = req.body;

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
        const { id } = req.params;
        const newPhotoURL = req.file?.path;
        let { requestDate } = req.body;

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
