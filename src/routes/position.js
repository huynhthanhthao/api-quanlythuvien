const express = require("express");
const PositionController = require("../controllers/position.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.POSITION_CREATE]), async function (req, res, next) {
    try {
        const data = await PositionController.createPosition(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.POSITION_UPDATE]), async function (req, res, next) {
    try {
        const data = await PositionController.updatePositionById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.POSITION_DELETE]), async function (req, res, next) {
    try {
        const data = await PositionController.deletePositionByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.POSITION_VIEW]), async function (req, res, next) {
    try {
        const data = await PositionController.getPositionById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.POSITION_VIEW]), async function (req, res, next) {
    try {
        const data = await PositionController.getPositions(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
