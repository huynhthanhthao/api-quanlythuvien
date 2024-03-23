const express = require("express");
const LanguageController = require("../controllers/language.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/", checkPermission([ROLES.LANGUAGE_CREATE]), async function (req, res, next) {
    try {
        const data = await LanguageController.createLanguage(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.LANGUAGE_DELETE]), async function (req, res, next) {
    try {
        const data = await LanguageController.deleteLanguageByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id", checkPermission([ROLES.LANGUAGE_UPDATE]), async function (req, res, next) {
    try {
        const data = await LanguageController.updateLanguageById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

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
