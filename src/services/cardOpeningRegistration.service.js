const db = require("../models");

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

    static async getCardOpeningRegistrations(query, account) {}

    static async getCardOpeningRegistrationById(id, account) {}
}

module.exports = CardOpeningRegistrationService;
