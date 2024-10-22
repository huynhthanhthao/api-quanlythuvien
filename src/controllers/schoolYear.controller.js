const { transformer } = require("../../utils/server");
const SchoolYearService = require("../services/schoolYear.service");
const db = require("../models");

class SchoolYearController {
    static async getSchoolYears(req) {
        return transformer(await SchoolYearService.getSchoolYears(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getSchoolYearById(req) {
        const { id } = req.params;

        return transformer(await SchoolYearService.getSchoolYearById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createSchoolYear(req) {
        return transformer(
            await SchoolYearService.createSchoolYear(req.body, req.account),
            "Đã thêm dữ liệu kệ sách mới."
        );
    }

    static async updateSchoolYearById(req) {
        const { id } = req.params;
        return transformer(
            await SchoolYearService.updateSchoolYearById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteSchoolYearByIds(req) {
        const { ids } = req.body;

        return transformer(await SchoolYearService.deleteSchoolYearByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = SchoolYearController;
