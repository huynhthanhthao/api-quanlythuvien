const { transformer } = require("../../utils/server");
const BookingFormService = require("../services/bookingForm.service");

class BookingFormController {
    static async getBookingForms(req) {
        return transformer(
            await BookingFormService.getBookingForms(req.query, req.account),
            "Lấy danh sách thành công."
        );
    }

    static async getBookingFormById(req) {
        const { id } = req.params;
        return transformer(await BookingFormService.getBookingFormById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async deleteBookingFormByIds(req) {
        const ids = req.body?.ids || [];
        return transformer(await BookingFormService.deleteBookingFormByIds(ids, req.account), "Cập nhật thành công.");
    }

    static async confirmBookingForm(req) {
        return transformer(await BookingFormService.confirmBookingForm(req.body, req.account), "Xác nhận thành công.");
    }
}

module.exports = BookingFormController;
