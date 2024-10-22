const unidecode = require("unidecode");
const db = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { mapResponseBookingFormList, mapResponseBookingFormItem } = require("../map-responses/bookingForm.map-response");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE, LOAN_STATUS } = require("../../enums/common");
const { getStartOfDay, getEndOfDay, convertDate } = require("../../utils/server");
const { TABLE_NAME } = require("../../enums/languages");
const { errorCodes } = require("../../enums/error-code");
const ActivityService = require("./activityLog.service");
const UserService = require("./user.service");
const { CatchException } = require("../../utils/api-error");
const SchoolService = require("./school.service");
const TransporterService = require("./transporter.service");
const { getPagination } = require("../../utils/customer-sequelize");
const { bookingBookHtml } = require("../mails/bookingBook");

class BookingFormService {
    static async getBookingForms(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["formCode", "fullName", "readerCode"];
        const { from, to } = query;

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const whereBookingCondition = {
            [Op.and]: [
                keyword && {
                    [Op.or]: searchableFields.map(
                        (field) =>
                            db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                                [Op.iLike]: `%${unidecode(keyword)}%`,
                            }),
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col("user.fullName")), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        }),
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col("user.readerCode")), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        })
                    ),
                },
                { active: true },
                { schoolId: account.schoolId },
                from && { receiveDate: { [Op.gte]: getStartOfDay(convertDate(from)) } },
                to && { receiveDate: { [Op.lte]: getEndOfDay(convertDate(to)) } },
                query.isConfirmed && { isConfirmed: query.isConfirmed },
            ].filter(Boolean),
        };

        const whereCondition = { active: true, schoolId: account.schoolId };

        const { rows, count } = await db.BookingBorrowForm.findAndCountAll({
            where: whereBookingCondition,
            limit,
            offset,
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ["id", "fullName", "photoURL", "phone", "birthday", "email", "readerCode"],
                    where: whereCondition,
                    required: keyword ? true : false,
                },
            ],
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: mapResponseBookingFormList(rows),
        };
    }

    static async getBookingFormById(id, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const bookingBook = await db.BookingBorrowForm.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ["id", "fullName", "photoURL", "phone", "birthday", "email", "readerCode"],
                    where: whereCondition,
                    required: false,
                },
            ],
        });

        if (!bookingBook) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseBookingFormItem(bookingBook);
    }

    static async deleteBookingFormByIds(ids, account) {
        await db.BookingBorrowForm.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(ids),
                tableTarget: TABLE_NAME.BOOKING_BOOK_FORM,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );
    }

    static async createBookingForm(newForm, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const whereCondition = { active: true, schoolId: account.schoolId };
            // Lấy id bằng mã code
            const user = await this.getUserReaderCode(newForm.readerCode, account);

            await UserService.checkUserValidity(user.id, { schoolId: account.schoolId }, "readerCode");

            await Promise.all([
                this.checkBookBorrowed(newForm.bookIds, account),
                this.checkBookOrdered(newForm.bookIds, account),
            ]);

            const token = this.generateTokenForEmail();

            const bookingForm = await db.BookingBorrowForm.create(
                {
                    userId: user.id,
                    token,
                    formCode: await this.generateFormCode(account.schoolId),
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
                where: { ...whereCondition, id: { [Op.in]: bookIds } },
                attributes: [
                    "id",
                    "bookCode",
                    [db.sequelize.col("bookGroup.bookName"), "bookName"],
                    [db.sequelize.col("bookGroup.author"), "author"],
                ],
                include: [
                    {
                        model: db.BookGroup,
                        as: "bookGroup",
                        where: whereCondition,
                        attributes: [],
                        required: true,
                    },
                ],
            });

            const school = await SchoolService.getSchoolByIdOrDomain({ keyword: account.schoolId });

            const subject = "Xác nhận đặt trước mượn sách";

            if (school?.schoolEmailSMTP?.email && school?.schoolEmailSMTP?.password) {
                TransporterService.sendEmail(
                    user.email,
                    subject,
                    bookingBookHtml({ token, school, books, bookingForm, user }),
                    { email: school?.schoolEmailSMTP?.email, password: school?.schoolEmailSMTP?.password }
                );
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getUserReaderCode(readerCode, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };

        const user = await db.User.findOne({
            where: { ...whereCondition, readerCode: { [Op.iLike]: readerCode } },
            attributes: ["id", "email", "fullName", "phone", "readerCode"],
        });

        if (!user)
            throw new CatchException("Bạn đọc không tồn tại!", errorCodes.RESOURCE_NOT_FOUND, {
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

    static generateTokenForEmail() {
        const token = uuidv4();

        return token;
    }

    static async generateFormCode(schoolId) {
        const { dataValues: highestBook } = (await db.BookingBorrowForm.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("formCode")), "maxFormCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newFormCode = "PDT00001";

        if (highestBook && highestBook?.maxFormCode) {
            const currentNumber = parseInt(highestBook.maxFormCode.slice(3), 10);
            const nextNumber = currentNumber + 1;
            newFormCode = `PDT${nextNumber.toString().padStart(5, "0")}`;
        }

        return newFormCode;
    }
}

module.exports = BookingFormService;
