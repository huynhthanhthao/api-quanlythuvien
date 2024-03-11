const express = require("express");
const PublisherController = require("../controllers/publisher.controller");
const router = express.Router();

router.get("/:id", async function (req, res, next) {
    try {
        const data = await PublisherController.getPublisherById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await PublisherController.getPublishers(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
