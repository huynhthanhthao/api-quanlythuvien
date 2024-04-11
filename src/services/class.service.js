const unidecode = require("unidecode");
const db = require("../models");
const { Op } = require("sequelize");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");
const ActivityService = require("./activityLog.service");
const { CatchException } = require("../../utils/api-error");
const { getPagination } = require("../../utils/customer-sequelize");
const { mapResponseClassList, mapResponseClassItem } = require("../map-responses/class.map-response");

class ClassService {
    static async getClasses(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["className", "classCode"];

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

        const { rows, count } = await db.Class.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.SchoolYear,
                    as: "schoolYear",
                    where: whereCondition,
                    required: false,
                    attributes: ["year", "schoolYearDes"],
                },
            ],
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination: pagination,
            list: mapResponseClassList(rows),
        };
    }

    static async getClassById(id, account) {
        const whereCondition = { active: true, schoolId: account.schoolId };
        const classRoom = await db.Class.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.SchoolYear,
                    as: "schoolYear",
                    where: whereCondition,
                    required: false,
                    attributes: ["year", "schoolYearDes"],
                },
            ],
        });

        if (!classRoom) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseClassItem(classRoom);
    }

    static async createClass(newClass, account) {
        const classCode = await this.generateClassCode(account.schoolId);

        const newCreated = await db.Class.create({
            ...newClass,
            classCode: classCode,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });

        await ActivityService.createActivity(
            { dataTarget: newCreated.id, tableTarget: TABLE_NAME.CLASS, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updateClassById(updateClass, account) {
        const newCreated = await db.Class.update(
            {
                className: updateClass.className,
                classDes: updateClass.classDes,
                schoolYearId: updateClass.schoolYearId,
                updatedBy: account.id,
                schoolId: account.id,
            },
            { where: { active: true, id: updateClass.id, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            { dataTarget: newCreated.id, tableTarget: TABLE_NAME.CLASS, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deleteClassByIds(ids, account) {
        const whereCondition = { active: true, schoolId: account.id };

        const classHasReader = await db.Class.findAll({
            where: { ...whereCondition, id: { [Op.in]: ids } },
            attributes: ["id"],
            include: [
                {
                    model: db.ClassHasUser,
                    as: "classHasUser",
                    where: whereCondition,
                    required: true,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.User,
                            as: "user",
                            where: whereCondition,
                            required: true,
                            attributes: ["id"],
                        },
                    ],
                },
            ],
        });

        const classHasReaderIds = classHasReader.map((group) => +group.id);

        const idsNotValid = ids.filter((id) => classHasReaderIds.includes(+id));

        const idsValid = ids.filter((id) => !classHasReaderIds.includes(id));

        await db.Class.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: idsValid }, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(idsValid),
                tableTarget: TABLE_NAME.CLASS,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );

        if (idsNotValid.length > 0)
            throw new CatchException("Không thể xóa lớp học này!", errorCodes.DATA_IS_BINDING, {
                field: "ids",
                ids: idsNotValid,
            });
    }

    static async generateClassCode(schoolId) {
        const { dataValues: highestClass } = (await db.Class.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("classCode")), "maxClassCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newClassCode = "LH0001";

        if (highestClass && highestClass?.maxClassCode) {
            const currentNumber = parseInt(highestClass.maxClassCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newClassCode = `LH${nextNumber.toString().padStart(4, "0")}`;
        }

        return newClassCode;
    }
}

module.exports = ClassService;
