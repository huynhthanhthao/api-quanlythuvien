const { transformer } = require("../../utils/server");
const ClassService = require("../services/class.service");
const db = require("../models");

class ClassController {
    static async getClasses(req) {
        return transformer(await ClassService.getClasses(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getClassById(req) {
        const { id } = req.params;

        return transformer(await ClassService.getClassById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createClass(req) {
        return transformer(await ClassService.createClass(req.body, req.account), "Dữ liệu lớp mới đã được tạo.");
    }

    static async updateClassById(req) {
        const { id } = req.params;
        return transformer(
            await ClassService.updateClassById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteClassByIds(req) {
        const ids = req.body?.ids;
        return transformer(await ClassService.deleteClassByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = ClassController;
