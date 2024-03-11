const express = require("express");
const PenaltyTicketController = require("../controllers/penaltyTicket.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.createPenaltyTicket(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.deletePenaltyTicketByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/pay", async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.payPenaltyTicket(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.getPenaltyTicketByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.getPenaltyTickets(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
