const { Op } = require("sequelize");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const { checkIsDuplicates } = require("../../utils/customer-validate");
const { transformer } = require("../../utils/server");
const db = require("../models");
const BookLostService = require("../services/bookLost.service");

class BookLostController {
    static async createBookLost(req) {
        const { bookIds = [] } = req.body;

        if (bookIds?.length <= 0)
            throw new CatchException("Phải có ít nhất 1 quyển sách.", errorCodes.MISSING_DATA, {
                field: "bookIds",
            });

        if (checkIsDuplicates(bookIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "bookIds",
            });
        }

        return transformer(await BookLostService.createBookLost(req.body, req.account), "Báo mất sách thành công.");
    }

    static async updateBookLostById(req) {
        const { bookIds = [] } = req.body;
        const { id } = req.params;

        if (bookIds?.length <= 0)
            throw new CatchException("Phải có ít nhất 1 quyển sách.", errorCodes.MISSING_DATA, {
                field: "bookIds",
            });

        if (checkIsDuplicates(bookIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "bookIds",
            });
        }

        return transformer(
            await BookLostService.updateBookLostById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async getBookLostReports(req) {
        return transformer(
            await BookLostService.getBookLostReports(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }

    static async getBookLostReportById(req) {
        const { id } = req.params;
        return transformer(await BookLostService.getBookLostReportById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async deleteBookLostReportByIds(req) {
        const { ids } = req.body;
        return transformer(await BookLostService.deleteBookLostReportByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = BookLostController;
