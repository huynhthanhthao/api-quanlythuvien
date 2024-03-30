const unidecode = require("unidecode");
const { Op } = require("sequelize");
const db = require("../models");
const { DEFAULT_LIMIT, UNLIMITED, ACTIVITY_TYPE } = require("../../enums/common");
const { errorCodes } = require("../../enums/error-code");
const { TABLE_NAME } = require("../../enums/languages");
const { CatchException } = require("../../utils/api-error");
const ActivityService = require("./activityLog.service");
const { getPagination } = require("../../utils/customer-sequelize");

class PublisherService {
    static async getPublishers(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["pubName", "pubCode", "phone", "address", "email"];

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

        const { rows, count } = await db.Publisher.findAndCountAll({
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

    static async getPublisherById(id, account) {
        const publisher = await db.Publisher.findOne({
            where: { id, active: true, schoolId: account.schoolId },
            attributes: {
                exclude: ["updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
        });

        if (!publisher) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return publisher;
    }

    static async createPublisher(newPublisher, account) {
        const status = await db.Publisher.create({
            pubCode: await this.generatePubCode(account.schoolId),
            ...newPublisher,
            createdBy: account.id,
            updatedBy: account.id,
            schoolId: account.schoolId,
        });

        await ActivityService.createActivity(
            { dataTarget: status.id, tableTarget: TABLE_NAME.PUBLISHER, action: ACTIVITY_TYPE.CREATED },
            account
        );
    }

    static async updatePublisherById(updatePublisher, account) {
        await db.Publisher.update(
            {
                pubName: updatePublisher.pubName,
                pubDes: updatePublisher.pubDes,
                phone: updatePublisher.phone,
                address: updatePublisher.address,
                email: updatePublisher.email,
                updatedBy: account.id,
            },
            { where: { id: updatePublisher.id, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: updatePublisher.id, tableTarget: TABLE_NAME.PUBLISHER, action: ACTIVITY_TYPE.UPDATED },
            account
        );
    }

    static async deletePublisherByIds(ids, account) {
        await db.Publisher.update(
            {
                active: false,
                updatedBy: account.id,
            },
            { where: { id: { [Op.in]: ids }, active: true, schoolId: account.id } }
        );

        await ActivityService.createActivity(
            { dataTarget: JSON.stringify(ids), tableTarget: TABLE_NAME.PUBLISHER, action: ACTIVITY_TYPE.DELETED },
            account
        );
    }

    static async generatePubCode(schoolId) {
        const { dataValues: highestPublisher } = (await db.Publisher.findOne({
            attributes: [[db.sequelize.fn("MAX", db.sequelize.col("pubCode")), "maxPubCode"]],
            where: { schoolId },
        })) || { dataValues: null };

        let newPubCode = "NXB0001";

        if (highestPublisher && highestPublisher?.maxPubCode) {
            const currentNumber = parseInt(highestPublisher.maxPubCode.slice(3), 10);
            const nextNumber = currentNumber + 1;
            newPubCode = `NXB${nextNumber.toString().padStart(4, "0")}`;
        }

        return newPubCode;
    }
}

module.exports = PublisherService;
