const express = require("express");
const FieldController = require("../controllers/field.controller");
const router = express.Router();

router.get("/:id", async function (req, res, next) {
    try {
        const data = await FieldController.getFieldById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await FieldController.getFields(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
