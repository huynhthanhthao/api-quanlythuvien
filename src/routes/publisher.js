const express = require("express");
const PublisherController = require("../controllers/publisher.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.get("/:id", checkPermission(ROLES.PUBLISHER_VIEW), async function (req, res, next) {
    try {
        const data = await PublisherController.getPublisherById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission(ROLES.PUBLISHER_VIEW), async function (req, res, next) {
    try {
        const data = await PublisherController.getPublishers(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
