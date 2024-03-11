const express = require("express");
const LoanReceiptController = require("../controllers/loanReceipt.controller");
const router = express.Router();

router.post("/create", async function (req, res, next) {
    try {
        const data = await LoanReceiptController.createLoanReceipt(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/give-books-back", async function (req, res, next) {
    try {
        const data = await LoanReceiptController.giveBooksBack(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", async function (req, res, next) {
    try {
        const data = await LoanReceiptController.deleteLoanReceiptByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", async function (req, res, next) {
    try {
        const data = await LoanReceiptController.updateLoanReceiptById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", async function (req, res, next) {
    try {
        const data = await LoanReceiptController.getLoanReceiptByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const data = await LoanReceiptController.getLoanReceipts(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
