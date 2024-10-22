const express = require("express");
const RoleController = require("../controllers/role.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await RoleController.createRole(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
