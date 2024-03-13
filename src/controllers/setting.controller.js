const { transformer } = require("../../utils/server");
const SettingService = require("../services/setting.service");

class SettingController {
    static async createSetting(req) {
        return transformer(await SettingService.createSetting(req.body, req.account), "Đã thêm dữ liệu cài đặt mới.");
    }

    static async updateSettingBySchoolId(req) {
        const { id } = req.params;

        return transformer(
            await SettingService.updateSettingBySchoolId({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteSettingByIds(req) {
        const ids = req.body.ids || [];
        return transformer(await SettingService.deleteSettingByIds(ids, req.account), "Cập nhật thành công.");
    }

    static async getSettingById(req) {
        const { id } = req.params;
        return transformer(await SettingService.getSettingById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async getSettingBySchoolId(req) {
        return transformer(await SettingService.getSettingBySchoolId(req.account), "Lấy chi tiết thành công.");
    }

    static async getSettings(req) {
        return transformer(await SettingService.getSettings(req.query, req.account), "Lấy danh sách thành công.");
    }
}

module.exports = SettingController;
