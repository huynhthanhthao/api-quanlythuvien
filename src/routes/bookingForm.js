const express = require("express");
const router = express.Router();
const BookingFormController = require("../controllers/bookingForm.controller");

router.put("/delete", async function (req, res, next) {
    try {
        const data = await BookingFormController.deleteBookingFormByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        const data = await BookingFormController.getBookingFormById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await BookingFormController.getBookingForms(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
