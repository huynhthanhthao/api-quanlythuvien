const express = require("express");
const SettingController = require("../controllers/setting.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await SettingController.createSetting(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/update", checkPermission([ROLES.SETTING_UPDATE]), async function (req, res, next) {
    try {
        const data = await SettingController.updateSettingBySchoolId(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

// router.put("/delete", async function (req, res, next) {
//     try {
//         const data = await SettingController.deleteSettingByIds(req);
//         return res.json(data);
//     } catch (error) {
//         next(error);
//     }
// });

router.get("/active", checkPermission([ROLES.SETTING_VIEW]), async function (req, res, next) {
    try {
        const data = await SettingController.getSettingBySchoolId(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

// router.get("/:id", async function (req, res, next) {
//     try {
//         const data = await SettingController.getSettingById(req);
//         return res.json(data);
//     } catch (error) {
//         next(error);
//     }
// });

// router.get("/", async function (req, res, next) {
//     try {
//         const data = await SettingController.getSettings(req);
//         return res.json(data);
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = router;
