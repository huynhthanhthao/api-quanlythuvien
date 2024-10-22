const { transformer } = require("../../utils/server");
const ReportService = require("../services/report.service");

class ReportController {
    static async borrowReturnReport(req) {
        return transformer(await ReportService.borrowReturnReport(req.query, req.account), "Lấy thông tin thành công.");
    }

    static async readerReport(req) {
        return transformer(await ReportService.readerReport(req.query, req.account), "Lấy thông tin thành công.");
    }

    static async bookReport(req) {
        return transformer(await ReportService.bookReport(req.query, req.account), "Lấy thông tin thành công.");
    }

    static async loanReceiptReport(req) {
        return transformer(await ReportService.loanReceiptReport(req.query, req.account), "Lấy thông tin thành công.");
    }
}

module.exports = ReportController;
