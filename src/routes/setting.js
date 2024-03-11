const express = require("express");
const SettingController = require("../controllers/setting.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await SettingController.createSetting(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await SettingController.updateSettingById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await SettingController.deleteSettingByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/active", async function (req, res, next) {
    try {
        const data = await SettingController.getSettingActive(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        const data = await SettingController.getSettingById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await SettingController.getSettings(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
