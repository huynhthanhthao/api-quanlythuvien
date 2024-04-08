const express = require("express");
const router = express.Router();
const ReaderGroupController = require("../controllers/readerGroup.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");

router.post("/create", checkPermission([ROLES.READER_GROUP_CREATE]), async function (req, res, next) {
    try {
        const data = await ReaderGroupController.createReaderGroup(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.READER_GROUP_DELETE]), async function (req, res, next) {
    try {
        const data = await ReaderGroupController.deleteReaderGroupByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.READER_GROUP_UPDATE]), async function (req, res, next) {
    try {
        const data = await ReaderGroupController.updateReaderGroupById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.READER_GROUP_VIEW]), async function (req, res, next) {
    try {
        const data = await ReaderGroupController.getReaderGroupById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.READER_GROUP_VIEW]), async function (req, res, next) {
    try {
        const data = await ReaderGroupController.getReaderGroups(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
