const { Op } = require("sequelize");
const { CatchException } = require("../../utils/api-error");
const db = require("../models");
const { mapResponseBorrowReturnReport } = require("../map-responses/report.map-response");

class ReportService {
    static async borrowReturnReport(query, account) {
        const currentYear = new Date().getFullYear();

        const whereCondition = { active: true, schoolId: account.schoolId };
        const dataReport = await db.ReceiptHasBook.findAll({
            where: {
                [Op.and]: [
                    whereCondition,
                    db.sequelize.literal(`EXTRACT('year' FROM "loanReceipt"."receiveDate") = ${currentYear}`),
                ],
            },
            attributes: ["type"],
            include: [
                {
                    model: db.LoanReceipt,
                    as: "loanReceipt",
                    where: whereCondition,
                    required: false,
                    attributes: ["receiveDate", "returnDate"],
                },
            ],
        });

        return mapResponseBorrowReturnReport(dataReport);
    }
}

module.exports = ReportService;
