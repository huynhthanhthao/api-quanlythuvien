const express = require("express");
const router = express.Router();

const authRouter = require("./auth");

const accountRouter = require("./account");

const readerGroupRouter = require("./readerGroup");

const userRouter = require("./user");

const bookRouter = require("./book");

const fieldRouter = require("./field");

const positionRouter = require("./position");

const categoryRouter = require("./category");

const languageRouter = require("./language");

const publisherRouter = require("./publisher");

const classRouter = require("./class");

const bookRequestRouter = require("./bookRequest");

const finePolicyRouter = require("./finePolicy");

const loanReceiptRouter = require("./loanReceipt");

const penaltyTicketRouter = require("./penaltyTicket");

const bookStatusRouter = require("./bookStatus");

const settingRouter = require("./setting");

const reportRouter = require("./report");

const commonRouter = require("./common");

const activityRouter = require("./activityLog");

const bookLostRouter = require("./bookLost");

const roleRouter = require("./role");

const groupRoleRouter = require("./groupRole");

const permissionRouter = require("./permission");

const bookingBookRouter = require("./bookingForm");

const publicRouter = require("./public");

const cardOpeningFeeRouter = require("./cardOpeningFee");

const cardOpeningRegistrationRouter = require("./cardOpeningRegistration");

const checkToken = require("../middlewares/verifyToken");

router.use("/auth", authRouter);

router.use("/user", checkToken, userRouter);

router.use("/account", checkToken, accountRouter);

router.use("/reader-group", checkToken, readerGroupRouter);

router.use("/book", checkToken, bookRouter);

router.use("/field", checkToken, fieldRouter);

router.use("/position", checkToken, positionRouter);

router.use("/category", checkToken, categoryRouter);

router.use("/language", checkToken, languageRouter);

router.use("/publisher", checkToken, publisherRouter);

router.use("/class", checkToken, classRouter);

router.use("/book-request", checkToken, bookRequestRouter);

router.use("/book-status", checkToken, bookStatusRouter);

router.use("/fine-policy", checkToken, finePolicyRouter);

router.use("/loan-receipt", checkToken, loanReceiptRouter);

router.use("/penalty-ticket", checkToken, penaltyTicketRouter);

router.use("/setting", checkToken, settingRouter);

router.use("/report", checkToken, reportRouter);

router.use("/common", checkToken, commonRouter);

router.use("/activity", checkToken, activityRouter);

router.use("/book-lost", checkToken, bookLostRouter);

router.use("/role", checkToken, roleRouter);

router.use("/group-role", checkToken, groupRoleRouter);

router.use("/permission", checkToken, permissionRouter);

router.use("/booking-book", checkToken, bookingBookRouter);

router.use("/card-opening-fee", checkToken, cardOpeningFeeRouter);

router.use("/public", publicRouter);

router.use("/card-registration", checkToken, cardOpeningRegistrationRouter);

module.exports = router;
