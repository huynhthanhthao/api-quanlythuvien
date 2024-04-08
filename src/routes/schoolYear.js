const express = require("express");
const SchoolYearController = require("../controllers/schoolYear.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();
// checkPermission([ROLES.YEAR_SCHOOL_CREATE]),
router.post("/create", async function (req, res, next) {
    try {
        const data = await SchoolYearController.createSchoolYear(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});
// checkPermission([ROLES.YEAR_SCHOOL_UPDATE]),
router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await SchoolYearController.updateSchoolYearById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});
// checkPermission([ROLES.YEAR_SCHOOL_UPDATE]),
router.put("/delete", async function (req, res, next) {
    try {
        const data = await SchoolYearController.deleteSchoolYearByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});
// checkPermission([ROLES.YEAR_SCHOOL_VIEW]),
router.get("/:id", async function (req, res, next) {
    try {
        const data = await SchoolYearController.getSchoolYearById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});
// checkPermission([ROLES.YEAR_SCHOOL_VIEW]),
router.get("/", async function (req, res, next) {
    try {
        const data = await SchoolYearController.getSchoolYears(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
