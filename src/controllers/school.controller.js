const { transformer } = require("../../utils/server");
const SchoolService = require("../services/school.service");

class SchoolController {
    static async createSchool(req) {
        return transformer(await SchoolService.createSchool(req.body), "Tạo trường thành công.");
    }
}

module.exports = SchoolController;
