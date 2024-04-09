const express = require("express");
const AuthController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/login", async function (req, res, next) {
    try {
        const data = await AuthController.login(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/refresh-token", async function (req, res, next) {
    try {
        const data = await AuthController.refreshToken(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
