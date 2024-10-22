const express = require("express");
const CardOpeningFeeController = require("../controllers/cardOpeningFee.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.CARD_OPENING_FEE_CREATE]), async function (req, res, next) {
    try {
        const data = await CardOpeningFeeController.createCardOpeningFee(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.CARD_OPENING_FEE_DELETE]), async function (req, res, next) {
    try {
        const data = await CardOpeningFeeController.deleteCardOpeningFeeByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.CARD_OPENING_FEE_UPDATE]), async function (req, res, next) {
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
