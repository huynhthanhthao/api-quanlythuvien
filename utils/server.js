const moment = require("moment");

module.exports.transformer = function (result, message) {
    return {
        status: 1,
        message,
        data: result,
    };
};

module.exports.flattenObject = function (obj) {
    const result = {};

    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const nestedKeys = key.split(".");
            const finalKey = nestedKeys.length > 1 ? nestedKeys[nestedKeys.length - 1] : key;
            const value = obj[key];

            result[finalKey] = value;
        }
    }

    return result;
};

module.exports.flattenArray = function (arr) {
    return arr.map((arrItem) => module.exports.flattenObject(arrItem));
};

module.exports.customerURL = function (path) {
    if (path === undefined || path === null) {
        return path;
    }

    if (typeof path === "string" && path.startsWith("public")) {
        return path.slice(6);
    } else {
        return path;
    }
};

module.exports.convertDate = function (value) {
    if (!value) return null;

    const dateObject = moment(value, "DD/MM/YYYY");
    return dateObject.isValid() ? dateObject.format("YYYY-MM-DD HH:mm:ss") : "Invalid date";
};

module.exports.convertDateVi = function (value) {
    if (!value) return null;

    const dateObject = moment(value, "DD/MM/YYYY");
    return dateObject.isValid() ? dateObject.format("DD/MM/YYYY") : "Invalid date";
};

module.exports.convertToIntArray = function (str) {
    if (!str || str.length === 0) return null;

    if (/^[^0-9, ]+$/.test(str)) {
        return [];
    }

    const numbersStr = str.split(",");

    for (const num of numbersStr) {
        if (!/^-?\d+$/.test(num)) {
            return [];
        }
    }

    const numbers = numbersStr.map(Number);

    return numbers;
};

module.exports.calculateDaysDiff = function (inputDate) {
    const today = moment();
    const diffDays = moment(inputDate).locale("vi").diff(today, "days");
    return diffDays;
};

module.exports.fDate = function (date) {
    const utcTime = moment.utc(date);

    const vietnamTime = utcTime.add(7, "hours");

    return vietnamTime;
};

module.exports.getEndOfDay = function (date) {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
};

module.exports.getStartOfDay = function (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
};

module.exports.getDateNowTypeInt = function () {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const midnightTimestamp = now.getTime() / 1000;

    return midnightTimestamp;
};

module.exports.getStartOfYear = function (year) {
    return new Date(year, 0, 1);
};

module.exports.getEndOfYear = function (year) {
    return new Date(year, 11, 31, 23, 59, 59, 999);
};
