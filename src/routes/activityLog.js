const express = require("express");
const ActivityController = require("../controllers/activityLog.controller");
const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const data = await ActivityController.getActivities(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
