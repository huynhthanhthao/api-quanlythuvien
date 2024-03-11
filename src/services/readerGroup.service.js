const { Op } = require("sequelize");
const { DEFAULT_LIMIT, UNLIMITED } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const { getPagination } = require("../../utils/customer-sequelize");
const db = require("../models");
const unidecode = require("unidecode");

class ReaderGroupService {
    static async getReaderGroups(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableFields = ["groupCode", "groupName"];

        const whereCondition = {
            [Op.and]: [
                keyword && {
                    [Op.or]: searchableFields.map((field) =>
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        })
                    ),
                },
                { active: true },
                { schoolId: account.schoolId },
            ].filter(Boolean),
        };

        const { rows, count } = await db.ReaderGroup.findAndCountAll({
            where: whereCondition,
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: rows,
        };
    }

    static async getReaderGroupById(id, account) {
        const readerGroup = await db.ReaderGroup.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        if (!readerGroup) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return readerGroup;
    }

    static async getBorrowLimit(userId, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const readerGroup = await db.ReaderGroup.findOne({
            where: whereCondition,
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.User,
                    as: "userList",
                    where: { ...whereCondition, id: userId },
                    required: true,
                    attributes: {
                        exclude: ["id"],
                    },
                },
            ],
        });

        if (!readerGroup)
            throw new CatchException("Bạn đọc này chưa thuộc nhóm bạn đọc nào!", errorCodes.RESOURCE_NOT_FOUND, {
                field: "userId",
            });

        return { quantityLimit: readerGroup.quantityLimit, timeLimit: readerGroup.timeLimit } || null;
    }
}

module.exports = ReaderGroupService;
