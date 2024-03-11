const express = require("express");
const FinePolicyController = require("../controllers/finePolicy.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await FinePolicyController.createFinePolicy(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/create-with-book", async function (req, res, next) {
    try {
        const data = await FinePolicyController.connectPolicyWithBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update-with-book", async function (req, res, next) {
    try {
        const data = await FinePolicyController.updatePolicyWithBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await FinePolicyController.updateFinePolicyById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await FinePolicyController.deleteFinePolicyByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/with-book", async function (req, res, next) {
    try {
        const data = await FinePolicyController.getFinePolicyWithBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/with-book/:id", async function (req, res, next) {
    try {
        const data = await FinePolicyController.getFinePolicyWithBookById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", async function (req, res, next) {
    try {
        const data = await FinePolicyController.getFinePolicyByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await FinePolicyController.getFinePolicies(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
