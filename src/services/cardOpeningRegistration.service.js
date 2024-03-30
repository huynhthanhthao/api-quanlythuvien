const { Op } = require("sequelize");
const unidecode = require("unidecode");
const { DEFAULT_LIMIT, UNLIMITED } = require("../../enums/common");
const { getPagination } = require("../../utils/customer-sequelize");
const db = require("../models");
const {
    mapResponseRegistrationList,
    mapResponseRegistrationItem,
} = require("../map-responses/cardOpeningRegistration.map-response");
const { errorCodes } = require("../../enums/error-code");

class CardOpeningRegistrationService {
    static async createCardOpeningRegistration(newCardOpeningRegistration, account) {
        await db.CardOpeningRegistration.create({
            ...newCardOpeningRegistration,
            isConfirmed: false,
            schoolId: account.schoolId,
        });
    }

    static async confirmRegistrationById(registration, account) {
        await db.CardOpeningRegistration.update(
            {
                isConfirmed: registration.isConfirmed,
                updatedBy: account.id,
            },
            { where: { id: registration.id, active: true, schoolId: account.schoolId } }
        );
    }

    static async deleteCardOpeningRegistrationByIds(ids, account) {}

    static async getCardOpeningRegistrations(query, account) {
        let limit = +query.limit || DEFAULT_LIMIT;
        const page = +query.page || 1;
        const offset = (page - 1) * limit;
        const keyword = query.keyword?.trim() || "";
        const searchableFields = ["fullName", "email", "phone", "cardId"];

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

        const { rows, count } = await db.CardOpeningRegistration.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.CardOpeningFee,
                    as: "cardOpeningFee",
                    where: whereCondition,
                    required: false,
                    attributes: ["id", "fee", "effect", "feeDes"],
                },
            ],
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        const pagination = getPagination(count, limit, page);

        return {
            pagination,
            list: mapResponseRegistrationList(rows),
        };
    }

    static async getCardOpeningRegistrationById(id, account) {
        const registration = await db.CardOpeningRegistration.findOne({
            where: { id, active: true, schoolId: account.id, id },
            attributes: {
                exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
            },
            include: [
                {
                    model: db.CardOpeningFee,
                    as: "cardOpeningFee",
                    where: { id, active: true, schoolId: account.id, id },
                    required: false,
                    attributes: ["id", "fee", "effect", "feeDes"],
                },
            ],
        });

        if (!registration) throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);

        return mapResponseRegistrationItem(registration);
    }
}

module.exports = CardOpeningRegistrationService;
