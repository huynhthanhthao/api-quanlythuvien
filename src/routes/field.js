const express = require("express");
const FieldController = require("../controllers/field.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.FIELD_CREATE]), async function (req, res, next) {
    try {
        const data = await FieldController.createField(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.FIELD_DELETE]), async function (req, res, next) {
    try {
        const data = await FieldController.deleteFieldByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.FIELD_UPDATE]), async function (req, res, next) {
    try {
        const data = await FieldController.updateFieldById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.FIELD_VIEW]), async function (req, res, next) {
    try {
        const data = await FieldController.getFieldById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.FIELD_VIEW]), async function (req, res, next) {
    try {
        const data = await FieldController.getFields(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
