const express = require("express");
const SchoolYearController = require("../controllers/schoolYear.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.YEAR_SCHOOL_CREATE]), async function (req, res, next) {
    try {
        const data = await SchoolYearController.createSchoolYear(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.YEAR_SCHOOL_UPDATE]), async function (req, res, next) {
    try {
        const data = await SchoolYearController.updateSchoolYearById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.YEAR_SCHOOL_UPDATE]), async function (req, res, next) {
    try {
        const data = await SchoolYearController.deleteSchoolYearByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.YEAR_SCHOOL_VIEW]), async function (req, res, next) {
    try {
        const data = await SchoolYearController.getSchoolYearById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.YEAR_SCHOOL_VIEW]), async function (req, res, next) {
    try {
        const data = await SchoolYearController.getSchoolYears(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
