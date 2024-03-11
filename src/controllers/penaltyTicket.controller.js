const { PENALTY_TICKET_STATUS } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const { transformer } = require("../../utils/server");
const PenaltyTicketService = require("../services/penaltyTicket.service");

class PenaltyTicketController {
    static async createPenaltyTicket(req) {
        return transformer(
            await PenaltyTicketService.createPenaltyTicket(req.body, req.account),
            "Đã thêm dữ liệu phiếu phạt mới."
        );
    }

    static async getPenaltyTickets(req) {
        return transformer(
            await PenaltyTicketService.getPenaltyTickets(req.query, req.account),
            "Lấy phiếu phạt thành công."
        );
    }

    static async getPenaltyTicketByIdOrCode(req) {
        const { keyword } = req.params;
        return transformer(
            await PenaltyTicketService.getPenaltyTicketByIdOrCode(keyword, req.account),
            "Lấy chi tiết phiếu phạt thành công."
        );
    }

    static async payPenaltyTicket(req) {
        const { id } = req.params;
        const { status } = req.body;

        if (status != PENALTY_TICKET_STATUS.PAID && status != PENALTY_TICKET_STATUS.UNPAID)
            throw new CatchException("Trạng thái không hợp lệ.", errorCodes.INVALID_DATA, {
                field: "status",
            });

        return transformer(
            await PenaltyTicketService.payPenaltyTicket({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deletePenaltyTicketByIds(req) {
        const ticketIds = req.body.ticketIds || [];
        return transformer(
            await PenaltyTicketService.deletePenaltyTicketByIds(ticketIds, req.account),
            "Xóa thành công."
        );
    }
}

module.exports = PenaltyTicketController;
