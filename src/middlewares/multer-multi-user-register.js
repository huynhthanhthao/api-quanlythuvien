const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const HttpStatus = require("http-status-codes");
const { errorCodes } = require("../../enums/error-code");
const { DEFAULT_IMAGE_MAX_SIZE } = require("../../enums/common");
const { CatchException } = require("../../utils/api-error");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "public/documents/user-register";

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        cb(null, Date.now() + "-" + uniqueSuffix + "-" + file.originalname);
    },
});

const fileSizeLimit = DEFAULT_IMAGE_MAX_SIZE * 1024 * 1024;
const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|jfif)$/)) {
        return cb(new CatchException("Chỉ chấp nhận dữ liệu là hình ảnh!", errorCodes.INVALID_DATA));
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
