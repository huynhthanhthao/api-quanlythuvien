const express = require("express");
const BookRequestController = require("../controllers/bookRequest.controller");
const router = express.Router();
const upload = require("../middlewares/multer");

router.post("/create", upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await BookRequestController.createBookRequest(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", upload.single("photoFile"), async function (req, res, next) {
    try {
        const data = await BookRequestController.updateBookRequestById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await BookRequestController.deleteBookRequestByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", async function (req, res, next) {
    try {
        const data = await BookRequestController.getBookRequestByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await BookRequestController.getBookRequests(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
