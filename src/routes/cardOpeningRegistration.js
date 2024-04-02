const express = require("express");
const CardOpeningRegistrationService = require("../controllers/cardOpeningRegistration.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.put("/:id/confirm", checkPermission([ROLES.FORM_REGISTER_CONFIRM]), async function (req, res, next) {
    try {
        const data = await CardOpeningRegistrationService.confirmRegistrationById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.FORM_REGISTER_DELETE]), async function (req, res, next) {
    try {
        const data = await CardOpeningRegistrationService.deleteCardOpeningRegistrationByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.FORM_REGISTER_VIEW]), async function (req, res, next) {
    try {
        const data = await CardOpeningRegistrationService.getCardOpeningRegistrationById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.FORM_REGISTER_VIEW]), async function (req, res, next) {
    try {
        const data = await CardOpeningRegistrationService.getCardOpeningRegistrations(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
