const { transformer } = require("../../utils/server");
const CardOpeningRegistrationService = require("../services/cardOpeningRegistration.service");

class SettingController {
    static async createCardOpeningRegistration(req) {
        return transformer(
            await CardOpeningRegistrationService.createCardOpeningRegistration(req.body, req.account),
            "Đã thêm dữ liệu đăng ký mở thẻ mới."
        );
    }

    static async confirmRegistrationById(req) {
        const { id } = req.params;

        return transformer(
            await CardOpeningRegistrationService.confirmRegistrationById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteCardOpeningRegistrationByIds(req) {
        const ids = req.body.ids || [];
        return transformer(
            await CardOpeningRegistrationService.deleteCardOpeningRegistrationByIds(ids, req.account),
            "Cập nhật thành công."
        );
    }

    static async getCardOpeningRegistrationById(req) {
        const { id } = req.params;
        return transformer(
            await CardOpeningRegistrationService.getCardOpeningRegistrationById(id, req.account),
            "Lấy chi tiết thành công."
        );
    }

    static async getCardOpeningRegistrations(req) {
        return transformer(
            await CardOpeningRegistrationService.getCardOpeningRegistrations(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }
}

module.exports = SettingController;
