const express = require("express");
const UserController = require("../controllers/user.controller");
const router = express.Router();

/* GET users liSTRING. */
router.post("/create", async function (req, res, next) {
    try {
        const data = await UserController.createUser(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
