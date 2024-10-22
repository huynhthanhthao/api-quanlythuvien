const express = require("express");
const ActivityController = require("../controllers/activityLog.controller");
const { ROLES } = require("../../enums/permission");
const checkPermission = require("../middlewares/checkPermission");
const router = express.Router();

router.get("/", checkPermission([ROLES.ACTIVITY_LOG_VIEW]), async function (req, res, next) {
    try {
        const data = await ActivityController.getActivities(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
