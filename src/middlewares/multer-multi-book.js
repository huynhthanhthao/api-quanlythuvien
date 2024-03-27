const multer = require("multer");
const HttpStatus = require("http-status-codes");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");
const { DEFAULT_IMAGE_MAX_SIZE } = require("../../enums/common");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/documents/books");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const fileSizeLimit = DEFAULT_IMAGE_MAX_SIZE * 1024 * 1024;
const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|jfif|pdf|doc|docx|ppt|pptx|xls|xlsx)$/)) {
        return cb(new CatchException("Chỉ chấp nhận dữ liệu là hình ảnh hoặc tài liệu!", errorCodes.INVALID_DATA));
    }

    const fileSize = parseInt(req.headers["content-length"]);
    if (fileSize > fileSizeLimit) {
        return cb(
            new CatchException(
                HttpStatus.default.REQUEST_TOO_LONG,
                `${file.fieldname} quá giới hạn!`,
                errorCodes.INVALID_DATA
            )
        );
    }
    cb(null, true);
};

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter,
});
