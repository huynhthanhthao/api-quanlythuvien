const express = require("express");
const GroupRoleController = require("../controllers/groupRole.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await GroupRoleController.createGroupRole(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await GroupRoleController.getGroupRoles(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
