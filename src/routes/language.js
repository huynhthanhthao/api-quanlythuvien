const express = require("express");
const LanguageController = require("../controllers/language.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.get("/:id", checkPermission([ROLES.LANGUAGE_VIEW]), async function (req, res, next) {
    try {
        const data = await LanguageController.getLanguageById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.LANGUAGE_VIEW]), async function (req, res, next) {
    try {
        const data = await LanguageController.getLanguages(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
