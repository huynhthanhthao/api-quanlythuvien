const express = require("express");
const BookController = require("../controllers/book.controller");
const checkPermission = require("../middlewares/checkPermission");
const router = express.Router();
const upload = require("../middlewares/multer-multi-book");
const { ROLES } = require("../../enums/permission");

router.post(
    "/create",
    checkPermission([ROLES.BOOK_CREATE]),
    upload.fields([
        { name: "photoFile", maxCount: 1 },
        { name: "attachFiles", maxCount: 10 },
    ]),
    async function (req, res, next) {
        try {
            const data = await BookController.createBook(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.post("/create-book-code", checkPermission([ROLES.BOOK_CREATE]), async function (req, res, next) {
    try {
        const data = await BookController.createBookCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put(
    "/:id/update",
    checkPermission([ROLES.BOOK_UPDATE]),
    upload.fields([
        { name: "photoFile", maxCount: 1 },
        { name: "attachFiles", maxCount: 10 },
    ]),
    async function (req, res, next) {
        try {
            const data = await BookController.updateBookGroupById(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.put("/delete", checkPermission([ROLES.BOOK_DELETE]), async function (req, res, next) {
    try {
        const data = await BookController.deleteBookGroupByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:code/code", checkPermission([ROLES.BOOK_VIEW]), async function (req, res, next) {
    try {
        const data = await BookController.getBookByCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkPermission([ROLES.BOOK_VIEW]), async function (req, res, next) {
    try {
        const data = await BookController.getBookGroupById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.BOOK_VIEW]), async function (req, res, next) {
    try {
        const data = await BookController.getBookGroups(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
