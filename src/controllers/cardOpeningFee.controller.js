const { transformer } = require("../../utils/server");
const CardOpeningFeeService = require("../services/cardOpeningFee.service");

class CardOpeningFeeController {
    static async createCardOpeningFee(req) {
        return transformer(
            await CardOpeningFeeService.createCardOpeningFee(req.body, req.account),
            "Tạo phí mở thẻ thành công."
        );
    }

    static async updateCardOpeningFeeById(req) {
        const { id } = req.params;
        return transformer(
            await CardOpeningFeeService.updateCardOpeningFeeById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteCardOpeningFeeByIds(req) {
        const { ids = [] } = req.body;
        return transformer(
            await CardOpeningFeeService.deleteCardOpeningFeeByIds(ids, req.account),
            "Cập nhật thành công."
        );
    }

    static async getCardOpeningFees(req) {
        return transformer(
            await CardOpeningFeeService.getCardOpeningFees(req.query, req.account),
            "Lấy danh sách hành công."
        );
    }

    static async getCardOpeningFeeById(req) {
        const { id } = req.params;
        return transformer(
            await CardOpeningFeeService.getCardOpeningFeeById(id, req.account),
            "Lấy chi tiết thành công."
        );
    }
}

module.exports = CardOpeningFeeController;
