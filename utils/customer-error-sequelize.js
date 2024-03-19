const { errorCodes } = require("../enums/error-code");

module.exports.removeDuplicateFieldItems = (errors) => {
    const seenFields = new Set();
    const uniqueItems = [];

    for (const item of errors) {
        const field = item.field;

        if (!seenFields.has(field)) {
            seenFields.add(field);

            uniqueItems.push(item);
        }
    }

    return uniqueItems;
};

module.exports.customErrorMessage = (error) => {
    const messages = [];

    error.errors?.forEach((error) => {
        if (error?.type == "notNull Violation" || error?.validatorKey == "notEmpty")
            return messages.push({
                field: error?.path,
                code: errorCodes.MISSING_DATA,
                message: `Trường ${error?.path} không được để trống!`,
            });

        if (
            error?.validatorKey == "isNumeric" ||
            error?.validatorKey == "isDate" ||
            error?.validatorKey == "isPhone" ||
            error?.validatorKey == "isEmail"
        )
            return messages.push({
                field: error?.path,
                code: errorCodes.DATA_INCORRECT_FORMAT,
                message: `Trường ${error?.path} không đúng định dạng!`,
            });

        if (error?.validatorKey == "isInEnum")
            return messages.push({
                field: error?.path,
                code: errorCodes.INVALID_DATA,
                message: `Trường ${error?.path} không hợp lệ!`,
            });

        if (error?.validatorKey == "checkForeignKey" || error?.validatorKey == "checkEmptyForeignKey")
            return messages.push({
                field: error?.path,
                code: errorCodes.RESOURCE_NOT_FOUND,
                message: `Trường ${error?.path} không tồn tại!`,
            });

        if (error?.validatorKey == "len")
            return messages.push({
                field: error?.path,
                code: errorCodes.REQUEST_TOO_LONG,
                message: `Trường ${error?.path} số lượng kí tự không hợp lệ!`,
            });

        if (error?.validatorKey == "isUnique")
            return messages.push({
                field: error?.path,
                code: errorCodes.DATA_ALREADY_EXISTS,
                message: `Trường ${error?.path} dữ liệu đã tồn tại!`,
            });
    });

    if (messages.length == 0)
        messages.push({
            code: "UNKNOWN_ERROR",
            message: error.message || "Có lỗi xảy ra!",
        });

    return module.exports.removeDuplicateFieldItems(messages);
};

module.exports.customErrorMessageDatabase = (error) => {
    if (error.original?.code == "22003")
        return { message: "Dữ liệu vượt quá giới hạn!", code: errorCodes.INVALID_DATA };

    if (error.original?.code == "22007")
        return { message: "Lỗi định dạng ngày!", code: errorCodes.DATA_INCORRECT_FORMAT };

    if (error.original?.code == "23503")
        return { message: "Không tìm thấy tài nguyên!", code: errorCodes.RESOURCE_NOT_FOUND };

    if (error.original?.code == "22P02")
        return { message: "Dữ liệu không đúng định dạng!", code: errorCodes.DATA_INCORRECT_FORMAT };
    return error;
};
