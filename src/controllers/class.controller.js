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
}

module.exports = ClassController;
