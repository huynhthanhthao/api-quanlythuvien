const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { CatchException } = require("../../utils/api-error");
const db = require("../models");
const { LOAN_STATUS, QUERY_ONE_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const TransporterService = require("./transporter.service");
const { bookingBookHtml } = require("../mails/bookingBook");
const { calculateDaysDiff, getStartOfDay, convertDate, getEndOfDay, fDate } = require("../../utils/server");
const SchoolService = require("./school.service");

class PublishService {
    static async createBookingForm(newForm, account) {
        let transaction;
        try {
            const whereCondition = { active: true, schoolId: account.schoolId };
            transaction = await db.sequelize.transaction();
            // Lấy id bằng mã code
            const user = await this.getUserReaderCode(newForm.readerCode, account);

            await Promise.all([
                this.checkBookBorrowed(newForm.bookIds, account),
                this.checkBookOrdered(newForm.bookIds, account),
            ]);

            const token = this.generateTokenForEmail();

            const bookingForm = await db.BookingBorrowForm.create(
                {
                    userId: user.id,
                    token,
                    receiveDate: newForm.receiveDate,
                    bookingDes: newForm.bookingDes,
                    schoolId: account.schoolId,
                },
                { transaction }
            );

            const bookIds = newForm.bookIds || [];

            const bookBorrowData = bookIds.map((bookId) => ({
                bookId,
                formId: bookingForm.id,
                schoolId: account.schoolId,
            }));

            await db.BookingHasBook.bulkCreate(bookBorrowData, { transaction });

            // gửi email
            const books = await db.Book.findAll({
                where: whereCondition,
                attributes: ["id", "bookCode", "bookName", "photoURL", "author"],
            });

            const school = await SchoolService.getSchoolByIdOrDomain({ keyword: account.schoolId });

            const subject = "Xác nhận đặt trước mượn sách";

            await TransporterService.sendEmail(books, user.email, token, subject, bookingBookHtml({ token, school }));

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static generateTokenForEmail() {
        const token = uuidv4();

        return token;
    }

    static async getUserReaderCode(readerCode, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const user = await db.User.findOne({
            where: { ...whereCondition, readerCode: { [Op.iLike]: readerCode } },
            attributes: ["id", "email", "fullName", "phone"],
        });

        if (!user)
            throw new CatchException("Bạn đọc không tồn tài!", errorCodes.RESOURCE_NOT_FOUND, {
                field: "readerCode",
            });

        return user;
    }

    static async checkBookBorrowed(bookIds, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const bookBorrowed = await db.Book.findAll({
            where: { ...whereCondition, id: { [Op.in]: bookIds } },
            attributes: ["id"],
            include: [
                {
                    model: db.ReceiptHasBook,
                    as: "receiptHasBook",
                    where: { ...whereCondition, type: LOAN_STATUS.BORROWING },
                    required: true,
                    attributes: [],
                },
            ],
        });

        if (bookBorrowed.length > 0)
            throw new CatchException("Sách đặt không sẳn sàng!", errorCodes.BOOK_IS_BORROWED, {
                field: "bookIds",
                bookIds: bookBorrowed.map((book) => book.id),
            });
    }

    static async checkBookOrdered(bookIds, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const bookOrdered = await db.Book.findAll({
            where: { ...whereCondition, id: { [Op.in]: bookIds } },
            attributes: ["id"],
            include: [
                {
                    model: db.BookingHasBook,
                    as: "bookingHasBook",
                    where: { ...whereCondition },
                    required: true,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.BookingBorrowForm,
                            as: "bookingForm",
                            where: { ...whereCondition, isConfirmed: true },
                            required: true,
                            attributes: [],
                        },
                    ],
                },
            ],
        });

        if (bookOrdered.length > 0)
            throw new CatchException("Sách đặt không sẳn sàng!", errorCodes.BOOK_IS_BORROWED, {
                field: "bookIds",
                bookIds: bookOrdered.map((book) => book.id),
            });
    }

    static async confirmBookingForm(data) {
        const school = await SchoolService.getSchoolByIdOrDomain({
            keyword: data.schoolDomain,
            type: QUERY_ONE_TYPE.DOMAIN,
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

        if (bookingForm.isConfirmed) return;

        if (!bookingForm) throw new CatchException("Không tìm thiếu phiếu đặt trước!", errorCodes.RESOURCE_NOT_FOUND);

        const dayLate = -calculateDaysDiff(bookingForm.receiveDate);

        if (dayLate > 1) throw new CatchException("Phiếu đặt trước đã hết hạn!", errorCodes.RESOURCE_HAS_EXPIRED);

        const bookBookingIds = bookingForm.bookingHasBook?.map((booking) => booking.bookId);

        await this.checkBookIdsReady(bookBookingIds, school.id);

        await db.BookingBorrowForm.update(
            { isConfirmed: true },
            {
                where: { ...whereCondition, isConfirmed: false, token: data.token },
            }
        );
    }

    static async checkBookIdsReady(bookIds, schoolId) {
        const whereCondition = { active: true, schoolId };

        const [bookFormExisted, bookBorrowed] = await Promise.all([
            db.BookingBorrowForm.findOne({
                where: {
                    ...whereCondition,
                    isConfirmed: true,
                    receiveDate: { [Op.lte]: getEndOfDay(new Date()) },
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
