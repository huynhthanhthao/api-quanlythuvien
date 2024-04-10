const HttpStatus = require("http-status-codes");
const { errorCodes } = require("../enums/error-code");

class ExceptionResponse {
    constructor(message = "Dữ liệu không hợp lệ!", code = errorCodes.INTERNAL_SERVER_ERROR, option) {
        this.message = message;
        this.code = code;
        this.option = option;
    }
}

class CatchException extends ExceptionResponse {
    constructor(message, code, option) {
        super(message, code, option);
    }
}

module.exports = {
    ExceptionResponse,
    CatchException,
};
