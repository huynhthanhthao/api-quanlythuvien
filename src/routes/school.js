const express = require("express");
const SchoolController = require("../controllers/school.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await SchoolController.createSchool(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
