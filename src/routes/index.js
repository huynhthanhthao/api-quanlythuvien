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

const checkToken = require("../middlewares/verifyToken");

router.use("/auth", authRouter);

router.use("/user", checkToken, userRouter);

router.use("/account", accountRouter);

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

module.exports = router;
