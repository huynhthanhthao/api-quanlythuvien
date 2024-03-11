const express = require("express");
const BookStatusController = require("../controllers/bookStatus.controller");
const router = express.Router();

router.get("/:id", async function (req, res, next) {
    try {
        const data = await BookStatusController.getBookStatusById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await BookStatusController.getBookStatuses(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
