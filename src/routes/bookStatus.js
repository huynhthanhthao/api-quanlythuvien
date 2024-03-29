const express = require("express");
const BookStatusController = require("../controllers/bookStatus.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/", checkPermission([ROLES.BOOK_STATUS_CREATE]), async function (req, res, next) {
    try {
        const data = await BookStatusController.createBookStatus(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.BOOK_STATUS_DELETE]), async function (req, res, next) {
    try {
        const data = await BookStatusController.deleteBookStatusByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id", checkPermission([ROLES.BOOK_STATUS_UPDATE]), async function (req, res, next) {
    try {
        const data = await BookStatusController.updateBookStatusById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.BOOK_STATUS_VIEW]), async function (req, res, next) {
    try {
        const data = await BookStatusController.getBookGroupstatusById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.BOOK_STATUS_VIEW]), async function (req, res, next) {
    try {
        const data = await BookStatusController.getBookGroupstatuses(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
