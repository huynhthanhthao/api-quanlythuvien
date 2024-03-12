const express = require("express");
const CommonController = require("../controllers/common.controller");
const router = express.Router();

router.get("/date-now", async function (req, res, next) {
    try {
        const data = await CommonController.getDateNow(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
