const express = require("express");
const PublisherController = require("../controllers/publisher.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/", checkPermission([ROLES.PUBLISHER_CREATE]), async function (req, res, next) {
    try {
        const data = await PublisherController.createPublisher(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.PUBLISHER_DELETE]), async function (req, res, next) {
    try {
        const data = await PublisherController.deletePublisherByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id", checkPermission([ROLES.PUBLISHER_UPDATE]), async function (req, res, next) {
    try {
        const data = await PublisherController.updatePublisherById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.PUBLISHER_VIEW]), async function (req, res, next) {
    try {
        const data = await PublisherController.getPublisherById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.PUBLISHER_VIEW]), async function (req, res, next) {
    try {
        const data = await PublisherController.getPublishers(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
