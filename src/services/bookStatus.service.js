const { Op } = require("sequelize");
const { DEFAULT_LIMIT, UNLIMITED } = require("../../enums/common");
const { CatchException } = require("../../utils/api-error");
const db = require("../models");
const unidecode = require("unidecode");
const { errorCodes } = require("../../enums/error-code");
const { getPagination } = require("../../utils/customer-sequelize");

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

    static async getBookGroupstatusById(id, account) {
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

    static async createBookStatus(newBookStatus, account) {}

    static async updateBookStatusById(updateBookStatus, account) {}

    static async deleteBookStatusByIds(ids, account) {}
}

module.exports = BookStatusService;
