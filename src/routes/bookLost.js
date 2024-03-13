const express = require("express");
const BookLostController = require("../controllers/bookLost.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await BookLostController.createBookLost(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await BookLostController.updateBookLostById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await BookLostController.deleteBookLostReportByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        const data = await BookLostController.getBookLostReportById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await BookLostController.getBookLostReports(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
