const { CatchException } = require("../../utils/api-error");
const BookService = require("../services/book.service");
const PublishService = require("../services/public.service");
const { transformer, convertDate, fDate, getDateNowTypeInt } = require("../../utils/server");
const { errorCodes } = require("../../enums/error-code");
const { isDate } = require("../../utils/customer-validate");

class PublicController {
    static async getBooks(req) {
        const schoolId = req.params?.schoolId || 0;
        return transformer(await BookService.getBooks(req.query, { schoolId }), "Lấy danh sách thành công.");
    }

    static async createBookingForm(req) {
        const { schoolId = 0 } = req.params;
        const { bookIds = [], readerCode } = req.body;
        let { receiveDate } = req.body;
        const receiveDateTime = new Date(convertDate(receiveDate)).getTime() / 1000;
        const nowDateTime = getDateNowTypeInt();

        if (!readerCode)
            throw new CatchException("Mã bạn đọc không được để trống!", errorCodes.MISSING_DATA, {
                field: "readerCode",
            });

        if (bookIds?.length == 0)
            throw new CatchException("Phải có ít nhất 1 quyển sách.", errorCodes.MISSING_DATA, {
                field: "bookIds",
            });

        if ((!isDate(receiveDate) && receiveDate) || receiveDateTime < nowDateTime) {
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ!", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "receiveDate",
            });
        }

        receiveDate = convertDate(receiveDate);

        return transformer(
            await PublishService.createBookingForm({ ...req.body, receiveDate }, { schoolId }),
            "Đăng kí thành công."
        );
    }

    static async getBookByIdOrCode(req) {
        const { keyword, schoolId = 0 } = req.params;
        const type = req.query?.type || 0;

        return transformer(
            await BookService.getBookByIdOrCode({ keyword, type }, { schoolId }),
            "Lấy chi tiết thành công."
        );
    }

    static async confirmBookingForm(req) {
        const { schoolId = 0 } = req.params;
        const { token } = req.query;

        return transformer(
            await PublishService.confirmBookingForm({ ...req.body, token }, { schoolId }),
            "Xác nhận thành công."
        );
    }
}

module.exports = PublicController;
