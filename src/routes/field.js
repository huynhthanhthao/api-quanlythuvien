const express = require("express");
const FieldController = require("../controllers/field.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

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
