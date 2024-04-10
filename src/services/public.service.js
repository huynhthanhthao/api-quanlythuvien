const { Op } = require("sequelize");
const { CatchException } = require("../../utils/api-error");
const db = require("../models");
const { LOAN_STATUS, QUERY_ONE_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { calculateDaysDiff, getEndOfDay } = require("../../utils/server");

const SchoolService = require("./school.service");

class PublishService {
    static async confirmBookingForm(data) {
        const school = await SchoolService.getSchoolByIdOrDomain({
            keyword: data.schoolId,
        });

        const whereCondition = { active: true, schoolId: school.id };

        const bookingForm = await db.BookingBorrowForm.findOne({
            where: { ...whereCondition, token: data.token },
            include: [
                {
                    model: db.BookingHasBook,
                    as: "bookingHasBook",
                    where: whereCondition,
                    required: false,
                    attributes: ["id", "bookId"],
                },
            ],
        });

        if (!bookingForm) throw new CatchException("Không tìm thấy phiếu đặt trước!", errorCodes.RESOURCE_NOT_FOUND);

        if (bookingForm.isConfirmed) return;

        const dayLate = -calculateDaysDiff(bookingForm.receiveDate);

        if (dayLate > 1) throw new CatchException("Phiếu đặt trước đã hết hạn!", errorCodes.RESOURCE_HAS_EXPIRED);

        const bookBookingIds = bookingForm.bookingHasBook?.map((booking) => booking.bookId);

        await this.checkBookIdsReady(bookBookingIds, school.id);

        await this.checkMaxBooking(bookBookingIds, bookingForm.userId, school.id);

        await db.BookingBorrowForm.update(
            { isConfirmed: true },
            {
                where: { ...whereCondition, isConfirmed: false, token: data.token },
            }
        );
    }

    static async checkMaxBooking(bookBookingIds, userId, schoolId) {
        const whereCondition = { active: true, schoolId: schoolId };
        const user = await db.User.findOne({
            where: { ...whereCondition, id: userId },
            attributes: ["id"],
            include: [
                {
                    model: db.ReaderGroup,
                    as: "readerGroup",
                    where: whereCondition,
                    required: true,
                    attributes: ["id", "maxBookingQuantity"],
                },
            ],
        });

        const countBooking = await db.BookingHasBook.findAll({
            where: whereCondition,
            attributes: ["id"],
            include: [
                {
                    model: db.BookingBorrowForm,
                    as: "bookingForm",
                    where: {
                        ...whereCondition,
                        isConfirmed: true,
                        userId,
                        receiveDate: { [Op.gte]: getEndOfDay(new Date()) },
                    },
                    required: true,
                    attributes: ["id"],
                },
            ],
        });

        if (countBooking.length + bookBookingIds.length > user?.readerGroup?.maxBookingQuantity) {
            throw new CatchException("Vượt quá số lượng sách đặt trước!", errorCodes.EXCEEDED_MAX_BOOKING_QUANTITY);
        }
    }

    static async checkBookIdsReady(bookIds, schoolId) {
        const whereCondition = { active: true, schoolId };

        const [bookFormExisted, bookBorrowed] = await Promise.all([
            db.BookingBorrowForm.findOne({
                where: {
                    ...whereCondition,
                    isConfirmed: true,
                    receiveDate: { [Op.gte]: getEndOfDay(new Date()) },
                },
                attributes: ["id"],
                include: [
                    {
                        model: db.BookingHasBook,
                        as: "bookingHasBook",
                        where: { ...whereCondition, bookId: { [Op.in]: bookIds } },
                        required: true,
                        attributes: ["id"],
                    },
                ],
            }),
            db.Book.findOne({
                where: {
                    ...whereCondition,
                    id: { [Op.in]: bookIds },
                },
                attributes: ["id"],
                include: [
                    {
                        model: db.ReceiptHasBook,
                        as: "receiptHasBook",
                        where: { ...whereCondition, type: LOAN_STATUS.BORROWING },
                        required: true,
                        attributes: ["id"],
                    },
                ],
            }),
        ]);

        if (bookBorrowed || bookFormExisted)
            throw new CatchException("Sách đặt trước không khả dụng!", errorCodes.RESOURCE_NOT_AVAILABLE);
    }
}

module.exports = PublishService;
