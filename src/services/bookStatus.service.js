const db = require("../models");
const { Op } = require("sequelize");
const unidecode = require("unidecode");
const { getPagination } = require("../../utils/customer-sequelize");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");
const ActivityService = require("./activityLog.service");
const { CatchException } = require("../../utils/api-error");

class BookStatusService {
    static async getBookGroupstatuses(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableBookStatuses = ["statusName"];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const whereCondition = {
            [Op.and]: [
                keyword && {
                    [Op.or]: searchableBookStatuses.map((bookStatus) =>
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(bookStatus)), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        })
                    ),
                },
                { active: true },
                { schoolId: account.schoolId },
            ].filter(Boolean),
        };

        const { rows, count } = await db.BookStatus.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: rows,
        };
    }

    static async getBookGroupStatusById(id, account) {
        const bookStatus = await db.BookStatus.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            order: [["createdAt", "DESC"]],
        });

        if (!bookStatus) new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return bookStatus;
    }

    static async createBookStatus(newBookStatus, account) {
        const status = await db.BookStatus.create({
            statusName: newBookStatus.statusName,
            statusDes: newBookStatus.statusDes,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });

        await ActivityService.createActivity(
            { dataTarget: status.id, tableTarget: TABLE_NAME.BOOK_STATUS, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updateBookStatusById(updateBookStatus, account) {
        await db.BookStatus.update(
            {
                statusName: updateBookStatus.statusName,
                statusDes: updateBookStatus.statusDes,
                updatedBy: account.id,
            },
            { where: { id: updateBookStatus.id, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: updateBookStatus.id, tableTarget: TABLE_NAME.BOOK_STATUS, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deleteBookStatusByIds(ids, account) {
        await db.BookStatus.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: JSON.stringify(ids), tableTarget: TABLE_NAME.BOOK_STATUS, action: ACTIVITY_TYPE.DELETED },
            account
        );
    }
}

module.exports = BookStatusService;
