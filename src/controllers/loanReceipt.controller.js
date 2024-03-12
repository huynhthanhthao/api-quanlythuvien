const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const { transformer, convertDate, getDateNowTypeInt } = require("../../utils/server");
const LoanReceiptService = require("../services/loanReceipt.service");
const { isDate, checkIsDuplicates } = require("../../utils/customer-validate");
const db = require("../models");

class LoanReceiptController {
    static async createLoanReceipt(req) {
        let { returnDate, books } = req.body;
        const { schoolId } = req.account;
        const returnDateTime = new Date(convertDate(returnDate)).getTime() / 1000;
        const nowDateTime = getDateNowTypeInt();

        const loanReceipt = await db.LoanReceipt.build({ ...req.body, schoolId });
        await loanReceipt.validate();

        for (const book of books) {
            const bookHasStatus = await db.BookHasStatus.build({ schoolId, bookId: book.id, statusId: book.statusId });
            await bookHasStatus.validate({ fields: ["bookId", "statusId"] });
        }

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
        const { schoolId } = req.account;
        const returnDateTime = new Date(convertDate(returnDate)).getTime() / 1000;
        const nowDateTime = getDateNowTypeInt();

        const loanReceipt = await db.LoanReceipt.build({ ...req.body, id, schoolId });

        await loanReceipt.validate();

        for (const book of books) {
            const bookHasStatus = await db.BookHasStatus.build({ schoolId, bookId: book.id, statusId: book.statusId });
            await bookHasStatus.validate({ fields: ["bookId", "statusId"] });
        }

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
        const { bookIds = [] } = req.body;

        if (checkIsDuplicates(bookIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.INVALID_DATA, {
                field: "bookIds",
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
