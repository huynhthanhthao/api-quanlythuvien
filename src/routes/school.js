const express = require("express");
const SchoolController = require("../controllers/school.controller");
const router = express.Router();
const upload = require("../middlewares/multer-multi-other");
const { ROLES } = require("../../enums/permission");
const checkPermission = require("../middlewares/checkPermission");

router.put(
    "/update",
    checkPermission([ROLES.SCHOOL_UPDATE]),
    upload.single("photoFile"),
    async function (req, res, next) {
        try {
            const data = await SchoolController.updateSchoolByToken(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.get("/me", checkPermission([ROLES.SCHOOL_UPDATE, ROLES.SCHOOL_VIEW]), async function (req, res, next) {
    try {
        const data = await SchoolController.getSchoolByToken(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put(
    "/email/update",
    checkPermission([ROLES.SCHOOL_UPDATE]),
    upload.single("photoFile"),
    async function (req, res, next) {
        try {
            const data = await SchoolController.updateEmailSMTP(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
