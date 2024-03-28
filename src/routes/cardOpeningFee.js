const express = require("express");
const CardOpeningFeeController = require("../controllers/cardOpeningFee.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await CardOpeningFeeController.createCardOpeningFee(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await CardOpeningFeeController.deleteCardOpeningFeeByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await CardOpeningFeeController.updateCardOpeningFeeById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        const data = await CardOpeningFeeController.getCardOpeningFeeById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await CardOpeningFeeController.getCardOpeningFees(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
