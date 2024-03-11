const express = require("express");
const LanguageController = require("../controllers/language.controller");
const router = express.Router();

router.get("/:id", async function (req, res, next) {
    try {
        const data = await LanguageController.getLanguageById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await LanguageController.getLanguages(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
