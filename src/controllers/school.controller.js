const { transformer } = require("../../utils/server");
const SchoolService = require("../services/school.service");

class SchoolController {
    static async createUser(req) {
        return transformer(await SchoolService.createSchool(req.body, req.account), "Tạo trường thành công.");
    }
}

module.exports = SchoolController;
