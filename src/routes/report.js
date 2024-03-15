const express = require("express");
const ReportController = require("../controllers/report.controller");
const { ROLES } = require("../../enums/permission");
const checkPermission = require("../middlewares/checkPermission");
const router = express.Router();

router.get("/loan-payment", checkPermission(ROLES.REPORT_LOAN_GIVE_BOOK), async function (req, res, next) {
    try {
        const data = await ReportController.borrowReturnReport(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/reader", checkPermission(ROLES.REPORT_READER), async function (req, res, next) {
    try {
        const data = await ReportController.readerReport(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/book", checkPermission(ROLES.REPORT_BOOK), async function (req, res, next) {
    try {
        const data = await ReportController.bookReport(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/loan-receipt", checkPermission(ROLES.REPORT_LOAN_GIVE_BOOK), async function (req, res, next) {
    try {
        const data = await ReportController.loanReceiptReport(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
