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
const CardOpeningRegistrationService = require("../services/cardOpeningRegistration.service");
const CardOpeningFeeService = require("../services/cardOpeningFee.service");
const SchoolService = require("../services/school.service");

class PublicController {
    static async getBookGroups(req) {
        const schoolId = req.params?.schoolId || 0;
        return transformer(await BookService.getPublicBookGroup(req.query, { schoolId }), "Lấy danh sách thành công.");
    }

    static async createBookingForm(req) {
        const { bookIds = [], readerCode, schoolId = 0 } = req.body;
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

    static async getBookGroupPublic(req) {
        const { keyword, schoolId = 0 } = req.params;
        const { type } = req.query;

        return transformer(
            await BookService.getBookGroupPublic({ keyword, type }, { schoolId }),
            "Lấy chi tiết thành công."
        );
    }

    static async confirmBookingForm(req) {
        return transformer(await PublishService.confirmBookingForm({ ...req.body }), "Xác nhận thành công.");
    }

    static async createSchool(req) {
        return transformer(await SchoolService.createSchool(req.body), "Tạo trường thành công.");
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

    static async createCardOpeningRegistration(req) {
        const { schoolId = 0 } = req.body;
        const photo3x4 = req.files?.photo3x4?.[0]?.path;
        const cardFrontPhoto = req.files?.cardFrontPhoto?.[0]?.path;
        const cardBackPhoto = req.files?.cardBackPhoto?.[0]?.path;

        return transformer(
            await CardOpeningRegistrationService.createCardOpeningRegistration(
                { ...req.body, photo3x4, cardFrontPhoto, cardBackPhoto },
                { schoolId }
            ),
            "Đã thêm dữ liệu đăng ký mở thẻ mới."
        );
    }

    static async getCardOpeningFees(req) {
        const { schoolId = 0 } = req.params;

        return transformer(
            await CardOpeningFeeService.getCardOpeningFees(req.query, { schoolId }),
            "Lấy danh sách hành công."
        );
    }
}

module.exports = PublicController;
