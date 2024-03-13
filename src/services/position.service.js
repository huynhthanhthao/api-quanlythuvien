const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const { CatchException } = require("../../utils/api-error");
const { getPagination } = require("../../utils/customer-sequelize");
const ActivityService = require("./activityLog.service");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");

class PositionService {
    static async createPosition(newPosition, account) {
        const positionCode = await this.generatePositionCode(account.schoolId);

        const position = await db.Position.create({
            positionCode,
            positionName: newPosition.positionName,
            positionDes: newPosition.positionDes,
            schoolId: account.schoolId,
            createdBy: account.id,
            updatedBy: account.id,
        });

        await ActivityService.createActivity(
            { dataTarget: position.id, tableTarget: TABLE_NAME.POSITION, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updatePositionById(updatePosition, account) {
        await db.Position.update(
            {
                id: updatePosition.id,
                schoolId: account.schoolId,
                positionName: updatePosition.positionName,
                positionDes: updatePosition.positionDes,
                updatedBy: account.id,
            },
            { where: { id: updatePosition.id, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            { dataTarget: updatePosition.id, tableTarget: TABLE_NAME.POSITION, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deletePositionByIds(positionIds, account) {
        await db.Position.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: positionIds }, active: true, schoolId: account.schoolId } }
        );

        await ActivityService.createActivity(
            {
                dataTarget: JSON.stringify(positionIds),
                tableTarget: TABLE_NAME.POSITION,
                action: ACTIVITY_TYPE.DELETED,
            },
            account
        );
    }

    static async generatePositionCode(schoolId) {
        const { dataValues: highestPosition } = (await db.Position.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("positionCode")), "maxPositionCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newPositionCode = "KS0001";

        if (highestPosition && highestPosition?.maxPositionCode) {
            const currentNumber = parseInt(highestPosition.maxPositionCode.slice(2), 10);
            const nextNumber = currentNumber + 1;
            newPositionCode = `KS${nextNumber.toString().padStart(4, "0")}`;
        }

        return newPositionCode;
    }

    static async getPositions(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["positionCode", "positionName"];

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

        const { rows, count } = await db.Position.findAndCountAll({
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

    static async getPositionById(id, account) {
        const position = await db.Position.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        if (!position) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return position;
    }
}

module.exports = PositionService;
