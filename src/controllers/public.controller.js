const { CatchException } = require("../../utils/api-error");
const BookService = require("../services/book.service");
const PublishService = require("../services/public.service");
const { transformer, convertDate, fDate, getDateNowTypeInt } = require("../../utils/server");
const { errorCodes } = require("../../enums/error-code");
const { isDate, checkIsDuplicates } = require("../../utils/customer-validate");
const CategoryService = require("../services/category.service");
const PublisherService = require("../services/publisher.service");
const LanguageService = require("../services/language.service");
const FieldService = require("../services/field.service");

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

        if (checkIsDuplicates(bookIds)) {
            throw new CatchException("Danh sách sách bị trùng lặp!", errorCodes.LIST_IS_DUPLICATED, {
                field: "bookIds",
            });
        }

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
        return transformer(await PublishService.confirmBookingForm({ ...req.body }), "Xác nhận thành công.");
    }

    static async getCategories(req) {
        const { schoolId = 0 } = req.params;

        return transformer(await CategoryService.getCategories(req.query, { schoolId }), "Lấy danh sách thành công.");
    }

    static async getPublishers(req) {
        const { schoolId = 0 } = req.params;

        return transformer(await PublisherService.getPublishers(req.query, { schoolId }), "Lấy danh sách thành công.");
    }

    static async getLanguages(req) {
        const { schoolId = 0 } = req.params;

        return transformer(await LanguageService.getLanguages(req.query, { schoolId }), "Lấy danh sách thành công.");
    }

    static async getFields(req) {
        const { schoolId = 0 } = req.params;

        return transformer(await FieldService.getFields(req.query, { schoolId }), "Lấy danh sách thành công.");
    }
}

module.exports = PublicController;
