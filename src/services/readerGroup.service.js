const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const { TABLE_NAME } = require("../../enums/languages");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { CatchException } = require("../../utils/api-error");
const ActivityService = require("./activityLog.service");
const { getPagination } = require("../../utils/customer-sequelize");

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

    static async createReaderGroup(newReaderGroup, account) {
        const groupCode = await this.generateReaderGroupCode(account.schoolId);

        const readerGroup = await db.ReaderGroup.create({
            groupCode,
            groupName: newReaderGroup.groupName,
            groupDes: newReaderGroup.groupDes,
            quantityLimit: newReaderGroup.quantityLimit,
            maxBookingQuantity: newReaderGroup.maxBookingQuantity,
            timeLimit: newReaderGroup.timeLimit,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });

        await ActivityService.createActivity(
            { dataTarget: readerGroup.id, tableTarget: TABLE_NAME.READER_GROUP, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updateReaderGroupById(updateReaderGroup, account) {
        await db.ReaderGroup.update(
            {
                groupName: updateReaderGroup.groupName,
                groupDes: updateReaderGroup.groupDes,
                quantityLimit: updateReaderGroup.quantityLimit,
                maxBookingQuantity: updateReaderGroup.maxBookingQuantity,
                timeLimit: updateReaderGroup.timeLimit,
                updatedBy: account.id,
            },
            { where: { id: updateReaderGroup.id, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: updateReaderGroup.id, tableTarget: TABLE_NAME.READER_GROUP, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deleteReaderGroupByIds(ids, account) {
        const whereCondition = { active: true, schoolId: account.id };

        const groupHasReader = await db.ReaderGroup.findAll({
            where: { ...whereCondition, id: { [Op.in]: ids } },
            attributes: ["id"],
            include: [
                {
                    model: db.User,
                    as: "userList",
                    where: whereCondition,
                    required: true,
                    attributes: ["id"],
                },
            ],
        });

        const groupHasReaderIds = groupHasReader.map((group) => +group.id);

        const idsNotValid = ids.filter((id) => groupHasReaderIds.includes(+id));

        const idsValid = ids.filter((id) => !groupHasReaderIds.includes(id));

        await db.ReaderGroup.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: idsValid }, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(idsValid),
                tableTarget: TABLE_NAME.READER_GROUP,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );

        if (idsNotValid.length > 0)
            throw new CatchException("Không thể xóa nhóm bạn đọc này!", errorCodes.DATA_IS_BINDING, {
                field: "ids",
                ids: idsNotValid,
            });
    }

    static async generateReaderGroupCode(schoolId) {
        const { dataValues: highestReaderGroup } = (await db.ReaderGroup.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("groupCode")), "maxReaderGroupCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newReaderGroupCode = "NBD0001";

        if (highestReaderGroup && highestReaderGroup?.maxReaderGroupCode) {
            const currentNumber = parseInt(highestReaderGroup.maxReaderGroupCode.slice(3), 10);
            const nextNumber = currentNumber + 1;
            newReaderGroupCode = `NBD${nextNumber.toString().padStart(4, "0")}`;
        }

        return newReaderGroupCode;
    }
}

module.exports = ReaderGroupService;
