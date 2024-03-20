const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const { transformer, convertDate, getDateNowTypeInt } = require("../../utils/server");
const LoanReceiptService = require("../services/loanReceipt.service");
const { isDate, checkIsDuplicates } = require("../../utils/customer-validate");
const db = require("../models");

class LoanReceiptController {
    static async createLoanReceipt(req) {
        let { returnDate, books } = req.body;
        const returnDateTime = new Date(convertDate(returnDate)).getTime() / 1000;
        const nowDateTime = getDateNowTypeInt();

        const bookIds = books.map((book) => book.id);

        if (checkIsDuplicates(bookIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "books",
            });
        }

        if ((!isDate(returnDate) && returnDate) || returnDateTime < nowDateTime) {
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ!", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "returnDate",
            });
        }

        returnDate = convertDate(returnDate);

        return transformer(
            await LoanReceiptService.createLoanReceipt({ ...req.body, returnDate }, req.account),
            "Đã thêm dữ liệu phiếu mượn mới."
        );
    }

    static async updateLoanReceiptById(req) {
        let { returnDate, books } = req.body;
        const { id } = req.params;
        const returnDateTime = new Date(convertDate(returnDate)).getTime() / 1000;
        const nowDateTime = getDateNowTypeInt();

        const bookIds = books.map((book) => book.id);

        if (checkIsDuplicates(bookIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "books",
            });
        }

        if ((!isDate(returnDate) && returnDate) || returnDateTime < nowDateTime) {
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ!", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "returnDate",
            });
        }

        returnDate = convertDate(returnDate);
        return transformer(
            await LoanReceiptService.updateLoanReceiptById({ ...req.body, returnDate, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async getLoanReceipts(req) {
        return transformer(
            await LoanReceiptService.getLoanReceipts(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }

    static async getLoanReceiptByIdOrCode(req) {
        const { keyword } = req.params;

        return transformer(
            await LoanReceiptService.getLoanReceiptByIdOrCode(keyword, req.account),
            "Lấy chi tiết thành công."
        );
    }

    static async giveBooksBack(req) {
        const { books = [] } = req.body;

        const bookIds = books.map((book) => book.id);

        if (checkIsDuplicates(bookIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "books",
            });
        }

        if (!req.body.userId)
            throw new CatchException("Người dùng không được để trống!", errorCodes.MISSING_DATA, {
                field: "userId",
            });

        if (bookIds?.length <= 0)
            throw new CatchException("Phải có ít nhất 1 quyển sách.", errorCodes.MISSING_DATA, {
                field: "bookIds",
            });

        return transformer(await LoanReceiptService.giveBooksBack(req.body, req.account), "Trả sách thành công.");
    }

    static async deleteLoanReceiptByIds(req) {
        const { ids } = req.body;

        return transformer(await LoanReceiptService.deleteLoanReceiptByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = LoanReceiptController;
