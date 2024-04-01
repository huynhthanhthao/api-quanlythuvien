const express = require("express");
const SchoolController = require("../controllers/school.controller");
const router = express.Router();
const upload = require("../middlewares/multer-multi-other");

router.put("/update", upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await SchoolController.updateSchoolByToken(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/me", async function (req, res, next) {
    try {
        const data = await SchoolController.getSchoolByToken(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/email/update", upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await SchoolController.updateEmailSMTP(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
