const db = require("../models");

class CommonService {
    static async getDateNow(newCommon) {
        return new Date();
    }
}

module.exports = CommonService;
