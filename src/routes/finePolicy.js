const express = require("express");
const FinePolicyController = require("../controllers/finePolicy.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.FINE_POLICY_CREATE]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.createFinePolicy(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/create-with-book", checkPermission([ROLES.FINE_POLICY_CREATE]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.connectPolicyWithBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update-with-book", checkPermission([ROLES.FINE_POLICY_UPDATE]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.updatePolicyWithBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.FINE_POLICY_UPDATE]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.updateFinePolicyById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.FINE_POLICY_DELETE]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.deleteFinePolicyByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete-with-book", checkPermission([ROLES.FINE_POLICY_DELETE]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.deleteFinePolicyWithBookByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/with-book", checkPermission([ROLES.FINE_POLICY_VIEW]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.getFinePolicyWithBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/with-book/:id", checkPermission([ROLES.FINE_POLICY_VIEW]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.getFinePolicyWithBookById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", checkPermission([ROLES.FINE_POLICY_VIEW]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.getFinePolicyByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.FINE_POLICY_VIEW]), async function (req, res, next) {
    try {
        const data = await FinePolicyController.getFinePolicies(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
