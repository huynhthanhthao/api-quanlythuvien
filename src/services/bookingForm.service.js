const db = require("../models");
const { Op } = require("sequelize");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");

class BookingFormService {
    static async getBookingForms(newForm, account) {}

    static async getBookingFormById(id, account) {}

    static async deleteBookingFormByIds(ids, account) {}

    static async confirmBookingForm(data, account) {}
}

module.exports = BookingFormService;
