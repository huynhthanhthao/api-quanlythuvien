const express = require("express");
const PublicController = require("../controllers/public.controller");
const router = express.Router();

router.get("/book/:keyword", async function (req, res, next) {
    try {
        const data = await PublicController.getBookByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/book", async function (req, res, next) {
    try {
        const data = await PublicController.getBooks(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
