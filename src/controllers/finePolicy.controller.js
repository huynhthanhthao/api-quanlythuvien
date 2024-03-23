const { transformer } = require("../../utils/server");
const FinePolicyService = require("../services/finePolicy.service");
const { checkIsDuplicates } = require("../../utils/customer-validate");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");

class FinePolicyController {
    static async getFinePolicies(req) {
        return transformer(
            await FinePolicyService.getFinePolicies(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }

    static async getFinePolicyWithBook(req) {
        return transformer(
            await FinePolicyService.getFinePolicyWithBook(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }

    static async getFinePolicyByIdOrCode(req) {
        const { keyword } = req.params;
        const type = req.query?.type || 0;

        return transformer(
            await FinePolicyService.getFinePolicyByIdOrCode({ keyword, type }, req.account),
            "Lấy chi tiết thành công."
        );
    }

    static async getFinePolicyWithBookById(req) {
        const { id } = req.params;

        return transformer(
            await FinePolicyService.getFinePolicyWithBookById(id, req.account),
            "Lấy chi tiết thành công."
        );
    }

    static async createFinePolicy(req) {
        const detailFinePolicy = req.body?.detailFinePolicy || [];

        if (detailFinePolicy.length == 0)
            throw new CatchException("Phải có ít nhất 1 chính sách phạt!", errorCodes.INVALID_DATA, {
                field: "detailFinePolicy",
            });

        return transformer(
            await FinePolicyService.createFinePolicy(req.body, req.account),
            "Đã thêm dữ liệu phí phạt mới."
        );
    }

    static async connectPolicyWithBook(req) {
        const { bookIds } = req.body;

        if (checkIsDuplicates(bookIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "bookIds",
            });
        }

        return transformer(
            await FinePolicyService.connectPolicyWithBook(req.body, req.account),
            "Đã thêm dữ liệu phí phạt mới."
        );
    }

    static async updatePolicyWithBook(req) {
        const { id } = req.params;

        return transformer(
            await FinePolicyService.updatePolicyWithBook({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async updateFinePolicyById(req) {
        const { id } = req.params;
        const detailFinePolicy = req.body?.detailFinePolicy || [];

        if (detailFinePolicy.length == 0)
            throw new CatchException("Phải có ít nhất 1 chính sách phạt!", errorCodes.INVALID_DATA, {
                field: "detailFinePolicy",
            });

        return transformer(
            await FinePolicyService.updateFinePolicyById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteFinePolicyByIds(req) {
        const { ids } = req.body;

        return transformer(await FinePolicyService.deleteFinePolicyByIds(ids, req.account), "Cập nhật thành công.");
    }

    static async deleteFinePolicyWithBookByIds(req) {
        const { ids } = req.body;

        return transformer(
            await FinePolicyService.deleteFinePolicyWithBookByIds(ids, req.account),
            "Cập nhật thành công."
        );
    }
}

module.exports = FinePolicyController;
