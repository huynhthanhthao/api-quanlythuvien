const { transformer } = require("../../utils/server");
const ReportService = require("../services/report.service");

class ReportController {
    static async borrowReturnReport(req) {
        return transformer(await ReportService.borrowReturnReport(req.query, req.account), "Lấy thông tin thành công.");
    }
}

module.exports = ReportController;
