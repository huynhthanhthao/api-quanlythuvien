const express = require("express");
const BookRequestController = require("../controllers/bookRequest.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();
const upload = require("../middlewares/multer");

router.post(
    "/create",
    checkPermission(ROLES.BOOK_REQUEST_CREATE),
    upload.single("photoFile"),
    async function (req, res, next) {
        try {
            const data = await BookRequestController.createBookRequest(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/:id/update",
    checkPermission(ROLES.BOOK_REQUEST_UPDATE),
    upload.single("photoFile"),
    async function (req, res, next) {
        try {
            const data = await BookRequestController.updateBookRequestById(req);
            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

router.put("/delete", checkPermission(ROLES.BOOK_REQUEST_DELETE), async function (req, res, next) {
    try {
        const data = await BookRequestController.deleteBookRequestByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", checkPermission(ROLES.BOOK_REQUEST_VIEW), async function (req, res, next) {
    try {
        const data = await BookRequestController.getBookRequestByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission(ROLES.BOOK_REQUEST_VIEW), async function (req, res, next) {
    try {
        const data = await BookRequestController.getBookRequests(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
