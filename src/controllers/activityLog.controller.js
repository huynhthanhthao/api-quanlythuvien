const { transformer } = require("../../utils/server");
const ActivityService = require("../services/activityLog.service");

class ActivityController {
    static async getActivities(req) {
        return transformer(await ActivityService.getActivities(req.query, req.account), "Lấy danh sách thành công.");
    }
}

module.exports = ActivityController;
