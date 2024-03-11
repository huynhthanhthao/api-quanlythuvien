const express = require("express");
const ClassController = require("../controllers/class.controller");
const router = express.Router();

router.get("/:id", async function (req, res, next) {
    try {
        const data = await ClassController.getClassById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await ClassController.getClasses(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
