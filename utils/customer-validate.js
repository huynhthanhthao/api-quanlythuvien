const HttpStatus = require("http-status-codes");
const { CatchException } = require("./api-error");
const { errorCodes } = require("../enums/error-code");
const { Op } = require("sequelize");

module.exports.checkForeignKey = async function (value = 0, model, options) {
    const data = await model.findOne({
        where: { id: +value, active: true, ...options },
    });

    if (!data) {
        throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);
    }
};

module.exports.checkEmptyForeignKey = async function (value = 0, model, options) {
    const data = await model.findOne({
        where: { id: +value, active: true, ...options },
    });
    if (!data && value) {
        throw new CatchException("Không tìm thấy tài nguyên!", errorCodes.RESOURCE_NOT_FOUND);
    }
};

module.exports.isUnique = async function (options) {
    const { field, value, model, extraConditions, id } = options;

    const whereClause = { [field]: value, active: true, ...(extraConditions || {}) };
    const data = await model.findOne({ where: whereClause });

    if (data && id != data.id && value) {
        throw new CatchException("Dữ liệu này đã tồn tại!", errorCodes.DATA_ALREADY_EXISTS);
    }
};

module.exports.isInEnum = function (value, enumArray) {
    if (!enumArray.includes(+value)) throw new CatchException("Dữ liệu không hợp lệ!", errorCodes.INVALID_DATA);
};

module.exports.isPhone = function (value) {
    const phoneValidationRegex = /^0\d{9}$/;
    if (!phoneValidationRegex.test(value) && value)
        throw new CatchException("Dữ liệu không hợp lệ!", errorCodes.INVALID_DATA);
};

module.exports.isEmail = function (value) {
    const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValidationRegex.test(value) && value)
        throw new CatchException("Dữ liệu không hợp lệ!", errorCodes.INVALID_DATA);
};

module.exports.validateModel = async function (model, validationOptions) {
    try {
        await model.validate(validationOptions);
        return null;
    } catch (error) {
        return error.errors.reduce((acc, curr) => {
            acc[curr.path] = curr.message;
            return acc;
        }, {});
    }
};

module.exports.isDate = function (value) {
    if (!value) return false;

    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (!regex.test(value)) return false;
    const [day, month] = value.split("/").map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }

    return true;
};

module.exports.isBirthday = function (value) {
    if (!value) return false;

    if (!module.exports.isDate(value)) return false;
    const [day, month, year] = value.split("/").map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    if (year < currentYear) {
        return true;
    }

    if (year === currentYear) {
        if (month < currentMonth) {
            return true;
        } else if (month === currentMonth) {
            if (day <= currentDay) {
                return true;
            }
        }
    }

    return false;
};

module.exports.checkIsDuplicates = function (arr) {
    var hash = {};

    for (var i = 0; i < arr.length; i++) {
        if (hash[arr[i]]) {
            return true;
        }
        hash[arr[i]] = true;
    }
    return false;
};
