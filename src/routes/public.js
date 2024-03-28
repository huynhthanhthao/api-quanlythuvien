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

router.get("/:schoolId/category", async function (req, res, next) {
    try {
        const data = await PublicController.getCategories(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:schoolId/publisher", async function (req, res, next) {
    try {
        const data = await PublicController.getPublishers(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:schoolId/language", async function (req, res, next) {
    try {
        const data = await PublicController.getLanguages(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:schoolId/field", async function (req, res, next) {
    try {
        const data = await PublicController.getFields(req);
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
