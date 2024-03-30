const express = require("express");
const HttpStatus = require("http-status-codes");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

require("dotenv").config();

const database = require("./database");
const app = express();

const indexRouter = require("./src/routes/index");
const { ValidationError } = require("sequelize");
const { CronJob } = require("cron");
const sendLateNotificationEmail = require("./src/crons/sendLateNotificationEmail");

var bodyParser = require("body-parser");
const { customErrorMessage, customErrorMessageDatabase } = require("./utils/customer-error-sequelize");
// connect database
database.connect();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// ### Fix CORS ###
const corsOptions = {
    origin: true,
    credentials: false, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

// CRON JOB
const job = new CronJob("0 0 9 * * *", function () {
    sendLateNotificationEmail();
});

job.start();

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/", indexRouter);

app.use((err, req, res, next) => {
    console.log(err);
    if (err instanceof ValidationError) {
        const validationErrors = {};
        const errorCustom = customErrorMessage(err);

        err.errors?.forEach((error) => {
            validationErrors[error.path] = error.message;
        });

        return res.status(HttpStatus.default.BAD_REQUEST).json({ status: 0, details: errorCustom });
    }
    const errorCustom = customErrorMessageDatabase(err);

    return res.status(HttpStatus.default.BAD_REQUEST).json({
        status: 0,
        details: [
            {
                code: errorCustom.code || "UNKNOWN_ERROR",
                message: errorCustom.message,
                ...errorCustom.option,
            },
        ],
    });
});

module.exports = app;
