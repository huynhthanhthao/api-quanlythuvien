const { Op } = require("sequelize");
const { DEFAULT_LIMIT, UNLIMITED } = require("../../enums/common");
const db = require("../models");
const unidecode = require("unidecode");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");
const { getPagination } = require("../../utils/customer-sequelize");

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
        const categoryCode = await this.generateCategoryCode(account.schoolId);

        await db.Category.create({
            categoryCode,
            categoryName: newCategory.categoryName,
            categoryDes: newCategory.categoryDes,
            schoolId: account.schoolId,
            createdBy: account.id,
            updatedBy: account.id,
        });
    }

    static async generateCategoryCode(schoolId) {
        const { dataValues: highestCategory } = (await db.Category.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("categoryCode")), "maxCategoryCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newCategoryCode = "DM0001";

        if (highestCategory && highestCategory?.maxCategoryCode) {
            const currentNumber = parseInt(highestCategory.maxCategoryCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newCategoryCode = `DM${nextNumber.toString().padStart(4, "0")}`;
        }

        return newCategoryCode;
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
    }

    static async deleteCategoryByIds(categoryIds, account) {
        await db.Category.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: categoryIds }, active: true, schoolId: account.schoolId } }
        );
    }
}

module.exports = CategoryService;
