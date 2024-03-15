const express = require("express");
const AccountController = require("../controllers/account.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await AccountController.createAccount(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await AccountController.updateAccountById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await AccountController.deleteAccountByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        const data = await AccountController.getAccountById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await AccountController.getAccounts(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
