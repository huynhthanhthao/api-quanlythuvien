const express = require("express");
const UserController = require("../controllers/readerGroup.controller");
const { ROLES } = require("../../enums/permission");
const checkPermission = require("../middlewares/checkPermission");
const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const data = await UserController.getReaderGroups(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
