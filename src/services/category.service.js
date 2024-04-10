const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const { getPagination } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { errorCodes } = require("../../enums/error-code");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { TABLE_NAME } = require("../../enums/languages");

class CategoryService {
    static async getCategories(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["categoryCode", "categoryName"];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

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

        const { rows, count } = await db.Category.findAndCountAll({
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

    static async getCategoryById(id, account) {
        const category = await db.Category.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        if (!category) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return category;
    }

    static async createCategory(newCategory, account) {
        const category = await db.Category.create({
            categoryCode: newCategory.categoryCode,
            categoryName: newCategory.categoryName,
            categoryDes: newCategory.categoryDes,
            schoolId: account.schoolId,
            createdBy: account.id,
            updatedBy: account.id,
        });

        await ActivityService.createActivity(
            { dataTarget: category.id, tableTarget: TABLE_NAME.CATEGORY, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updateCategoryById(updateCategory, account) {
        await db.Category.update(
            {
                id: updateCategory.id,
                schoolId: account.schoolId,
                categoryName: updateCategory.categoryName,
                categoryDes: updateCategory.categoryDes,
                updatedBy: account.id,
            },
            { where: { id: updateCategory.id, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            { dataTarget: updateCategory.id, tableTarget: TABLE_NAME.CATEGORY, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deleteCategoryByIds(categoryIds, account) {
        await db.Category.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: categoryIds }, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(categoryIds),
                tableTarget: TABLE_NAME.CATEGORY,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );
    }
}

module.exports = CategoryService;
