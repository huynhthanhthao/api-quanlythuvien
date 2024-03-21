const express = require("express");
const CategoryController = require("../controllers/category.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.CATEGORY_CREATE]), async function (req, res, next) {
    try {
        const data = await CategoryController.createCategory(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.CATEGORY_UPDATE]), async function (req, res, next) {
    try {
        const data = await CategoryController.updateCategoryById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.CATEGORY_DELETE]), async function (req, res, next) {
    try {
        const data = await CategoryController.deleteCategoryByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.CATEGORY_VIEW]), async function (req, res, next) {
    try {
        const data = await CategoryController.getCategoryById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.CATEGORY_VIEW]), async function (req, res, next) {
    try {
        const data = await CategoryController.getCategories(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
