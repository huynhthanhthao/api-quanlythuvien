const express = require("express");
const UserController = require("../controllers/user.controller");
const router = express.Router();
const upload = require("../middlewares/multer");

router.post("/create", upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await UserController.createUser(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await UserController.updateUserById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await UserController.deleteUserByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", async function (req, res, next) {
    try {
        const data = await UserController.getUserByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await UserController.getUsers(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
