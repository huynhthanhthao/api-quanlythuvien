const { transformer } = require("../../utils/server");
const CommonService = require("../services/common.service");

class CommonController {
    static async getDateNow(req) {
        return transformer(await CommonService.getDateNow(req.body, req.account), "Lấy ngày hiện tại thành công.");
    }
}

module.exports = CommonController;
