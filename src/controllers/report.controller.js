const { transformer } = require("../../utils/server");
const ReportService = require("../services/report.service");

class ReportController {
    static async reportLoan(req) {
        return transformer(await ReportService.reportLoan(req.query, req.account), "Lấy thông tin thành công.");
    }
}

module.exports = ReportController;
