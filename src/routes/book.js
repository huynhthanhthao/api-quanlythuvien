const express = require("express");
const BookController = require("../controllers/book.controller");
const checkPermission = require("../middlewares/checkPermission");
const router = express.Router();
const upload = require("../middlewares/multer");
const { ROLES } = require("../../enums/permission");

router.post("/create", checkPermission(ROLES.BOOK_CREATE), upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await BookController.createBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put(
    "/:id/update",
    checkPermission(ROLES.BOOK_UPDATE),
    upload.single("photoFile"),
    async function (req, res, next) {
        try {
            const data = await BookController.updateBookById(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.put("/delete", checkPermission(ROLES.BOOK_DELETE), async function (req, res, next) {
    try {
        const data = await BookController.deleteBookByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", checkPermission(ROLES.BOOK_VIEW), async function (req, res, next) {
    try {
        const data = await BookController.getBookByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission(ROLES.BOOK_VIEW), async function (req, res, next) {
    try {
        const data = await BookController.getBooks(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
