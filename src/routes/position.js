const express = require("express");
const PositionController = require("../controllers/position.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await PositionController.createPosition(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await PositionController.updatePositionById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await PositionController.deletePositionByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        const data = await PositionController.getPositionById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await PositionController.getPositions(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
