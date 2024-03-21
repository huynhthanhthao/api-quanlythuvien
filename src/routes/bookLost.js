const express = require("express");
const BookLostController = require("../controllers/bookLost.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.BOOK_LOST_CREATE]), async function (req, res, next) {
    try {
        const data = await BookLostController.createBookLost(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.BOOK_LOST_UPDATE]), async function (req, res, next) {
    try {
        const data = await BookLostController.updateBookLostById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.BOOK_LOST_DELETE]), async function (req, res, next) {
    try {
        const data = await BookLostController.deleteBookLostReportByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.BOOK_LOST_VIEW]), async function (req, res, next) {
    try {
        const data = await BookLostController.getBookLostReportById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.BOOK_LOST_VIEW]), async function (req, res, next) {
    try {
        const data = await BookLostController.getBookLostReports(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
