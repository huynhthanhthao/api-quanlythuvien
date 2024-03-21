const express = require("express");
const BookStatusController = require("../controllers/bookStatus.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.get("/:id", checkPermission([ROLES.BOOK_STATUS_VIEW]), async function (req, res, next) {
    try {
        const data = await BookStatusController.getBookStatusById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.BOOK_STATUS_VIEW]), async function (req, res, next) {
    try {
        const data = await BookStatusController.getBookStatuses(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
