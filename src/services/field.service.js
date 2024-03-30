const unidecode = require("unidecode");
const db = require("../models");
const { Op } = require("sequelize");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const ActivityService = require("./activityLog.service");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");
const { getPagination } = require("../../utils/customer-sequelize");

class FieldService {
    static async getFields(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["fieldName", "fieldCode"];

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

        const { rows, count } = await db.Field.findAndCountAll({
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
            pagination,
            list: rows,
        };
    }

    static async getFieldById(id, account) {
        const field = await db.Field.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            order: [["createdAt", "DESC"]],
        });

        if (!field) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return field;
    }

    static async createField(newField, account) {
        const fieldCode = await this.generateFieldCode(account.schoolId);

        const field = await db.Field.create({
            fieldCode,
            fieldName: newField.fieldName,
            fieldDes: newField.fieldDes,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });

        await ActivityService.createActivity(
            { dataTarget: field.id, tableTarget: TABLE_NAME.FIELD, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updateFieldById(updateField, account) {
        await db.Field.update(
            {
                fieldName: updateField.fieldName,
                fieldDes: updateField.fieldDes,
                updatedBy: account.id,
            },
            { where: { id: updateField.id, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: updateField.id, tableTarget: TABLE_NAME.FIELD, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deleteFieldByIds(ids, account) {
        await db.Field.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: JSON.stringify(ids), tableTarget: TABLE_NAME.FIELD, action: ACTIVITY_TYPE.DELETED },
            account
        );
    }

    static async generateFieldCode(schoolId) {
        const { dataValues: highestBook } = (await db.Field.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("fieldCode")), "maxFieldCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newFieldCode = "LV0001";

        if (highestBook && highestBook?.maxFieldCode) {
            const currentNumber = parseInt(highestBook.maxFieldCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newFieldCode = `LV${nextNumber.toString().padStart(4, "0")}`;
        }

        return newFieldCode;
    }
}

module.exports = FieldService;
