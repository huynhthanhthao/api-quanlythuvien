const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const { getPagination, bulkUpdate } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { convertToIntArray } = require("../../utils/server");
const { mapResponseFinePolicyList, mapResponseFinePolicyItem } = require("../map-responses/finePolicy.map-response");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");

class FinePolicyService {
    static async createFinePolicy(newFinePolicy, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const whereCondition = { active: true, schoolId: account.schoolId };
            const policyCode = newFinePolicy.policyCode || (await this.generateFinePolicyCode(account.schoolId));
            let isDefault = newFinePolicy.isDefault || false;

            const finePolicyDefault = await db.FinePolicy.findOne({
                where: { ...whereCondition, isDefault: true },
                attributes: ["id", "isDefault"],
            });

            if (!finePolicyDefault) {
                isDefault = true;
            }

            // if default update false other policy
            if (isDefault) await db.FinePolicy.update({ isDefault: false }, { where: whereCondition, transaction });

            const finePolicy = await db.FinePolicy.create(
                {
                    ...newFinePolicy,
                    isDefault,
                    policyCode: policyCode,
                    createdBy: account.id,
                    updatedBy: account.id,
                    schoolId: account.schoolId,
                },
                { transaction }
            );

            const detailFinePolicy = newFinePolicy.detailFinePolicy || [];

            const detailFinePolicyData = detailFinePolicy.map((detail) => ({
                finePolicyId: finePolicy.id,
                dayLate: detail.dayLate,
                fineAmount: detail.fineAmount,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            await db.DetailFinePolicy.bulkCreate(detailFinePolicyData, { transaction });

            await ActivityService.createActivity(
                { dataTarget: finePolicy.id, tableTarget: TABLE_NAME.FINE_POLICY, action: ACTIVITY_TYPE.CREATED },
                account,
                transaction
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateFinePolicyById(updateFinePolicy, account) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const policyCode = updateFinePolicy.policyCode || (await this.generateFinePolicyCode(account.schoolId));
            const whereCondition = { active: true, schoolId: account.schoolId };

            // check fine policy has default
            if (!updateFinePolicy?.isDefault) {
                const finePolicy = await db.FinePolicy.findOne({
                    where: { ...whereCondition, id: updateFinePolicy.id },
                    attributes: ["id", "isDefault"],
                });

                if (finePolicy?.isDefault)
                    throw new CatchException("Không thể cập nhật vì đang là mặc định!", errorCodes.INVALID_DATA, {
                        field: "isDefault",
                    });
            }

            // if default update false other policy
            if (updateFinePolicy?.isDefault)
                await db.FinePolicy.update({ isDefault: false }, { where: whereCondition, transaction });

            await db.FinePolicy.update(
                {
                    ...updateFinePolicy,
                    policyCode: policyCode,
                    updatedBy: account.id,
                    schoolId: account.schoolId,
                },
                { where: { id: updateFinePolicy.id, active: true, schoolId: account.schoolId }, transaction }
            );

            const detailFinePolicy = updateFinePolicy.detailFinePolicy || [];

            const detailFinePolicyData = detailFinePolicy.map((detail) => ({
                finePolicyId: updateFinePolicy.id,
                dayLate: detail.dayLate,
                fineAmount: detail.fineAmount,
                schoolId: account.schoolId,
                createdBy: account.id,
                updatedBy: account.id,
            }));

            await bulkUpdate(
                detailFinePolicyData,
                db.DetailFinePolicy,
                {
                    finePolicyId: updateFinePolicy.id,
                    schoolId: account.schoolId,
                },
                account,
                transaction
            );

            await ActivityService.createActivity(
                { dataTarget: updateFinePolicy.id, tableTarget: TABLE_NAME.FINE_POLICY, action: ACTIVITY_TYPE.UPDATED },
                account,
                transaction
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async generateFinePolicyCode(schoolId) {
        const { dataValues: highestFinePolicy } = (await db.FinePolicy.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("policyCode")), "maxFinePolicyCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newFinePolicyCode = "CS0001";

        if (highestFinePolicy && highestFinePolicy?.maxFinePolicyCode) {
            const currentNumber = parseInt(highestFinePolicy.maxFinePolicyCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newFinePolicyCode = `CS${nextNumber.toString().padStart(4, "0")}`;
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

        await ActivityService.createActivity(
            {
                dataTarget: finePolicy.finePolicyId,
                tableTarget: TABLE_NAME.FINE_POLICY_WITH_BOOK,
                action: ACTIVITY_TYPE.UPDATED,
            },
            account
        );

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

        await ActivityService.createActivity(
            {
                dataTarget: finePolicyHasBook.finePolicyId,
                tableTarget: TABLE_NAME.FINE_POLICY_WITH_BOOK,
                action: ACTIVITY_TYPE.UPDATED,
            },
            account
        );
    }

    static async deleteFinePolicyByIds(policyIds, account) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();
            const whereCondition = { active: true, schoolId: account.schoolId };

            const finePolicy = await db.FinePolicy.findOne({
                where: {
                    ...whereCondition,
                    id: {
                        [Op.in]: policyIds,
                    },
                },
                attributes: ["id", "isDefault"],
            });

            if (finePolicy?.isDefault)
                throw new CatchException("Không thể xóa vì đang là mặc định!", errorCodes.INVALID_DATA, {
                    id: finePolicy.id,
                });

            await db.FinePolicy.update(
                { active: false, updatedBy: account.id },
                { where: { active: true, schoolId: account.schoolId, id: { [Op.in]: policyIds } }, transaction }
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
                    transaction,
                }
            );

            await ActivityService.createActivity(
                {
                    dataTarget: JSON.stringify(policyIds),
                    tableTarget: TABLE_NAME.FINE_POLICY,
                    action: ACTIVITY_TYPE.DELETED,
                },
                account,
                transaction
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deleteFinePolicyWithBookByIds(policyWithBookIds, account) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();
            const whereCondition = { active: true, schoolId: account.schoolId };

            await db.FinePolicyHasBook.update(
                { active: false, updatedBy: account.id },
                {
                    where: {
                        ...whereCondition,
                        id: {
                            [Op.in]: policyWithBookIds,
                        },
                    },
                    transaction,
                }
            );

            await ActivityService.createActivity(
                {
                    dataTarget: JSON.stringify(policyWithBookIds),
                    tableTarget: TABLE_NAME.FINE_POLICY_WITH_BOOK,
                    action: ACTIVITY_TYPE.DELETED,
                },
                account,
                transaction
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
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
            include: [
                {
                    model: db.DetailFinePolicy,
                    as: "detailFinePolicy",
                    where: { active: true, schoolId: account.schoolId },
                    required: false,
                    attributes: {
                        exclude: ["id", "createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                    },
                },
            ],
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
            include: [
                {
                    model: db.DetailFinePolicy,
                    as: "detailFinePolicy",
                    where: { active: true, schoolId: account.schoolId },
                    required: false,
                    attributes: {
                        exclude: ["id", "createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                    },
                },
            ],
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

        return mapResponseFinePolicyItem(finePolicy);
    }
}

module.exports = FinePolicyService;
