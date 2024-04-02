const express = require("express");
const PenaltyTicketController = require("../controllers/penaltyTicket.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

// router.post("/create", async function (req, res, next) {
// try {
//     const data = await PenaltyTicketController.createPenaltyTicket(req);
//     return res.json(data);
// } catch (error) {
//     next(error);
// }
// });

router.put("/delete", checkPermission([ROLES.PENALTY_TICKET_DELETE]), async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.deletePenaltyTicketByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/pay", checkPermission([ROLES.PENALTY_TICKET_PAY]), async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.payPenaltyTicket(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", checkPermission([ROLES.PENALTY_TICKET_VIEW]), async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.getPenaltyTicketByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.PENALTY_TICKET_VIEW]), async function (req, res, next) {
    try {
        const data = await PenaltyTicketController.getPenaltyTickets(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
