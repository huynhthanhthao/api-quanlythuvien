const express = require("express");
const PermissionController = require("../controllers/permission.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.ACCOUNT_CREATE]), async function (req, res, next) {
    try {
        const data = await PermissionController.createPermission(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.ACCOUNT_UPDATE]), async function (req, res, next) {
    try {
        const data = await PermissionController.updatePermission(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.ACCOUNT_DELETE]), async function (req, res, next) {
    try {
        const data = await PermissionController.deletePermissionByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.ACCOUNT_VIEW]), async function (req, res, next) {
    try {
        const data = await PermissionController.getPermissionById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.ACCOUNT_VIEW]), async function (req, res, next) {
    try {
        const data = await PermissionController.getPermissions(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
