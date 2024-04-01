const express = require("express");
const PublicController = require("../controllers/public.controller");
const router = express.Router();
const upload = require("../middlewares/multer-multi-user-register");

router.post("/school/create", async function (req, res, next) {
    try {
        const data = await PublicController.createSchool(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/booking/create", async function (req, res, next) {
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

router.post(
    "/card/register",
    upload.fields([
        { name: "photo3x4", maxCount: 1 },
        { name: "cardFrontPhoto", maxCount: 1 },
        { name: "cardBackPhoto", maxCount: 1 },
    ]),
    async function (req, res, next) {
        try {
            const data = await PublicController.createCardOpeningRegistration(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

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

router.get("/:schoolId/card-opening-fee", async function (req, res, next) {
    try {
        const data = await PublicController.getCardOpeningFees(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:schoolId/book/:keyword", async function (req, res, next) {
    try {
        const data = await PublicController.getBookGroupPublic(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:schoolId/book", async function (req, res, next) {
    try {
        const data = await PublicController.getPublicBookGroup(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:schoolId/book-detail", async function (req, res, next) {
    try {
        const data = await PublicController.getBookDetail(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
