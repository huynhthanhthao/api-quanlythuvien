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

module.exports = router;
