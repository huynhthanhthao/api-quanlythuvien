const express = require("express");
const PublicController = require("../controllers/public.controller");
const router = express.Router();

router.post("/:schoolId/booking/create", async function (req, res, next) {
    try {
        const data = await PublicController.createBookingForm(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/booking/confirm", async function (req, res, next) {
    try {
        const data = await PublicController.confirmBookingForm(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:schoolId/book/:keyword", async function (req, res, next) {
    try {
        const data = await PublicController.getBookByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:schoolId/book", async function (req, res, next) {
    try {
        const data = await PublicController.getBooks(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
