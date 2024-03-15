const express = require("express");
const PermissionController = require("../controllers/permission.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await PermissionController.createPermission(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await PermissionController.updatePermission(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await PermissionController.deletePermissionByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        const data = await PermissionController.getPermissionById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await PermissionController.getPermissions(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
