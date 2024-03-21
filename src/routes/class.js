const express = require("express");
const ClassController = require("../controllers/class.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.get("/:id", checkPermission([ROLES.CLASS_VIEW]), async function (req, res, next) {
    try {
        const data = await ClassController.getClassById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.CLASS_VIEW]), async function (req, res, next) {
    try {
        const data = await ClassController.getClasses(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
