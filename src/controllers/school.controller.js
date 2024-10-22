const { transformer } = require("../../utils/server");
const SchoolService = require("../services/school.service");

class SchoolController {
    static async updateSchoolByToken(req) {
        const { id } = req.params;
        const photoURL = req.file?.path;
        return transformer(
            await SchoolService.updateSchoolByToken({ ...req.body, photoURL, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async updateEmailSMTP(req) {
        const { id } = req.params;
        const photoURL = req.file?.path;
        return transformer(
            await SchoolService.updateEmailSMTP({ ...req.body, photoURL, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async getSchoolByToken(req) {
        return transformer(await SchoolService.getSchoolByToken(req.query, req.account), "Lấy thông tin thành công.");
    }
}

module.exports = SchoolController;
