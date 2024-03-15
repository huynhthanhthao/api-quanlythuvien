const express = require("express");
const AccountController = require("../controllers/account.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");

const router = express.Router();

router.post("/create", checkPermission(ROLES.ACCOUNT_CREATE), async function (req, res, next) {
    try {
        const data = await AccountController.createAccount(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission(ROLES.ACCOUNT_UPDATE), async function (req, res, next) {
    try {
        const data = await AccountController.updateAccountById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission(ROLES.ACCOUNT_DELETE), async function (req, res, next) {
    try {
        const data = await AccountController.deleteAccountByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission(ROLES.ACCOUNT_VIEW), async function (req, res, next) {
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
