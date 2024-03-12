const express = require("express");
const ReportController = require("../controllers/report.controller");
const router = express.Router();

router.get("/loan-payment", async function (req, res, next) {
    try {
        const data = await ReportController.borrowReturnReport(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
