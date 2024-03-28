const unidecode = require("unidecode");
const db = require("../models");
const { Op } = require("sequelize");
const { CatchException } = require("../../utils/api-error");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { getPagination } = require("../../utils/customer-sequelize");
const { mapResponseBookingFormList, mapResponseBookingFormItem } = require("../map-responses/bookingForm.map-response");
const { getStartOfDay, getEndOfDay, convertDate } = require("../../utils/server");
const { errorCodes } = require("../../enums/error-code");
const ActivityService = require("./activityLog.service");
const { TABLE_NAME } = require("../../enums/languages");

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
}

module.exports = BookingFormService;
