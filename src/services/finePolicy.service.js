const { Op } = require("sequelize");
const { CatchException } = require("../../utils/api-error");
const db = require("../models");
const { DEFAULT_LIMIT, UNLIMITED } = require("../../enums/common");
const unidecode = require("unidecode");
const { convertToIntArray } = require("../../utils/server");
const { mapResponseFinePolicyList, mapResponseFinePolicyItem } = require("../map-responses/finePolicy.map-response");
const { getPagination } = require("../../utils/customer-sequelize");
const { errorCodes } = require("../../enums/error-code");

class FinePolicyService {
    static async createFinePolicy(newFinePolicy, account) {
        const policyCode = newFinePolicy.policyCode || (await this.generateFinePolicyCode(account.schoolId));

        await db.FinePolicy.create({
            ...newFinePolicy,
            policyCode: policyCode,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });
    }

    static async updateFinePolicyById(updateFinePolicy, account) {
        const policyCode = updateFinePolicy.policyCode || (await this.generateFinePolicyCode(account.schoolId));

        await db.FinePolicy.update(
            {
                ...updateFinePolicy,
                policyCode: policyCode,
                updatedBy: account.id,
                schoolId: account.schoolId,
            },
            { where: { id: updateFinePolicy.id, active: true, schoolId: account.schoolId } }
        );
    }

    static async generateFinePolicyCode(schoolId) {
        const { dataValues: highestFinePolicy } = (await db.FinePolicy.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("policyCode")), "maxFinePolicyCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newFinePolicyCode = "PP0001";

        if (highestFinePolicy && highestFinePolicy?.maxFinePolicyCode) {
            const currentNumber = parseInt(highestFinePolicy.maxFinePolicyCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newFinePolicyCode = `PP${nextNumber.toString().padStart(4, "0")}`;
        }

        return newFinePolicyCode;
    }

    static async connectPolicyWithBook(finePolicy, account) {
        const bookIds = finePolicy.bookIds || [];

        const dataInput = bookIds.map((bookId) => ({
            bookId,
            finePolicyId: finePolicy.finePolicyId,
            schoolId: account.schoolId,
            createdBy: account.id,
            updatedBy: account.id,
        }));

        await db.FinePolicyHasBook.bulkCreate(dataInput);
    }

    static async updatePolicyWithBook(finePolicyHasBook, account) {
        await db.FinePolicyHasBook.update(
            {
                finePolicyId: finePolicyHasBook.finePolicyId,
                bookId: finePolicyHasBook.bookId,
                schoolId: account.schoolId,
                updatedBy: account.id,
            },
            { where: { active: true, schoolId: account.schoolId, id: finePolicyHasBook.id } }
        );
    }

    static async deleteFinePolicyByIds(policyIds, account) {
        await db.FinePolicy.update(
            { active: false, updatedBy: account.id },
            { where: { active: true, schoolId: account.schoolId, id: { [Op.in]: policyIds } } }
        );

        await db.FinePolicyHasBook.update(
            { active: false, updatedBy: account.id },
            {
                where: {
                    active: true,
                    schoolId: account.schoolId,
                    finePolicyId: {
                        [Op.in]: policyIds,
                    },
                },
            }
        );
    }

    static async getFinePolicies(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableFields = ["policyCode", "policyName"];

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

        const { rows, count } = await db.FinePolicy.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: rows,
        };
    }

    static async getFinePolicyWithBook(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const finePolicyIds = query.finePolicyIds ? convertToIntArray(query.finePolicyIds) : [];

        if (query.unlimited && query.unlimited == UNLIMITED) {
            limit = null;
        }

        const searchableBookFields = ["bookName", "bookCode"];

        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        const whereBookCondition = {
            [Op.and]: [
                keyword && {
                    [Op.or]: searchableBookFields.map((field) =>
                        db.sequelize.where(db.sequelize.fn("unaccent", db.sequelize.col(field)), {
                            [Op.iLike]: `%${unidecode(keyword)}%`,
                        })
                    ),
                },
                { active: true },
                { schoolId: account.schoolId },
            ].filter(Boolean),
        };

        const whereFinePolicyCondition = {
            [Op.and]: [
                finePolicyIds.length > 0 && {
                    id: {
                        [Op.in]: finePolicyIds,
                    },
                },
                { active: true },
                { schoolId: account.schoolId },
            ].filter(Boolean),
        };

        const { rows, count } = await db.FinePolicyHasBook.findAndCountAll({
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            where: whereCondition,
            include: [
                {
                    model: db.Book,
                    as: "book",
                    where: whereCondition,
                    attributes: ["id", "bookName", "bookCode"],
                    required: keyword ? true : false,
                    where: whereBookCondition,
                },
                {
                    model: db.FinePolicy,
                    as: "finePolicy",
                    where: whereFinePolicyCondition,
                    required: finePolicyIds.length > 0 ? true : false,
                    attributes: ["id", "policyCode", "policyName"],
                },
            ],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: mapResponseFinePolicyList(rows),
        };
    }

    static async getFinePolicyByIdOrCode(keyword, account) {
        const whereFinePolicyCondition = {
            active: true,
            schoolId: account.schoolId,
        };

        if (isNaN(keyword)) {
            whereFinePolicyCondition.policyCode = keyword?.toUpperCase();
        } else {
            whereFinePolicyCondition.id = Number(keyword);
        }

        const finePolicy = await db.FinePolicy.findOne({
            where: whereFinePolicyCondition,
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        return finePolicy;
    }

    static async getFinePolicyWithBookById(id, account) {
        const whereCondition = {
            active: true,
            schoolId: account.schoolId,
        };
        const finePolicy = await db.FinePolicyHasBook.findOne({
            where: { ...whereCondition, id },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.Book,
                    as: "book",
                    where: whereCondition,
                    attributes: ["id", "bookName", "bookCode"],
                    where: whereCondition,
                    required: false,
                },
                {
                    model: db.FinePolicy,
                    as: "finePolicy",
                    attributes: ["id", "policyCode", "policyName"],
                    where: whereCondition,
                    required: false,
                },
            ],
        });

        if (!finePolicy) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return finePolicy;

        return mapResponseFinePolicyItem(finePolicy);
    }
}

module.exports = FinePolicyService;
