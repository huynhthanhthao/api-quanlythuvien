const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { CatchException } = require("../../utils/api-error");
const db = require("../models");
const { LOAN_STATUS } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");

class PublishService {
    static async createBookingForm(newForm, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            // Lấy id bằng mã code
            const userId = await this.getIdByReaderCode(newForm.readerCode, account);

            await Promise.all([
                this.checkBookBorrowed(newForm.bookIds, account),
                this.checkBookOrdered(newForm.bookIds, account),
            ]);

            const bookingForm = await db.BookingBorrowForm.create(
                {
                    userId,
                    token: this.generateTokenForEmail(),
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

    static async getIdByReaderCode(readerCode, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const user = await db.User.findOne({
            where: { ...whereCondition, readerCode: { [Op.iLike]: readerCode } },
            attributes: ["id"],
        });

        if (!user)
            throw new CatchException("Bạn đọc không tồn tài!", errorCodes.RESOURCE_NOT_FOUND, {
                field: "readerCode",
            });

        return user.id;
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
                bookIds: bookBorrowed.map((book) => book.id),
            });
    }
}

module.exports = PublishService;
