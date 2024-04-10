const express = require("express");
const UserController = require("../controllers/user.controller");
const checkPermission = require("../middlewares/checkPermission");
const router = express.Router();
const upload = require("../middlewares/multer-single-user");
const { ROLES } = require("../../enums/permission");

router.post(
    "/create",
    checkPermission([ROLES.USER_CREATE, ROLES.ACCOUNT_CREATE]),
    upload.single("photoFile"),
    async function (req, res, next) {
        try {
            const data = await UserController.createUser(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/create-from-excel",
    checkPermission([ROLES.USER_CREATE, ROLES.ACCOUNT_CREATE]),
    async function (req, res, next) {
        try {
            const data = await UserController.createUserFromExcel(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/:id/update",
    checkPermission([ROLES.USER_UPDATE, ROLES.ACCOUNT_UPDATE]),
    upload.single("photoFile"),
    async function (req, res, next) {
        try {
            const data = await UserController.updateUserById(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.put("/:id/extend", async function (req, res, next) {
    try {
        const data = await UserController.extendUser(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.USER_DELETE, ROLES.ACCOUNT_DELETE]), async function (req, res, next) {
    try {
        const data = await UserController.deleteUserByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", checkPermission([ROLES.USER_VIEW, ROLES.ACCOUNT_VIEW]), async function (req, res, next) {
    try {
        const data = await UserController.getUserByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.USER_VIEW]), async function (req, res, next) {
    try {
        const data = await UserController.getUsers(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
