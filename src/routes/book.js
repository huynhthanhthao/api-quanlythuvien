const express = require("express");
const BookController = require("../controllers/book.controller");
const router = express.Router();
const upload = require("../middlewares/multer");

router.post("/create", upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await BookController.createBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/lost-book", async function (req, res, next) {
    try {
        const data = await BookController.lostBook(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await BookController.updateBookById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await BookController.deleteBookByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", async function (req, res, next) {
    try {
        const data = await BookController.getBookByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await BookController.getBooks(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
