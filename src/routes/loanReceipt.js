const express = require("express");
const LoanReceiptController = require("../controllers/loanReceipt.controller");
const checkPermission = require("../middlewares/checkPermission");
const { ROLES } = require("../../enums/permission");
const router = express.Router();

router.post("/create", checkPermission([ROLES.LOAN_RECEIPT_CREATE]), async function (req, res, next) {
    try {
        const data = await LoanReceiptController.createLoanReceipt(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/give-books-back", checkPermission([ROLES.LOAN_RECEIPT_UPDATE]), async function (req, res, next) {
    try {
        const data = await LoanReceiptController.giveBooksBack(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/delete", checkPermission([ROLES.LOAN_RECEIPT_DELETE]), async function (req, res, next) {
    try {
        const data = await LoanReceiptController.deleteLoanReceiptByIds(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/update", checkPermission([ROLES.LOAN_RECEIPT_UPDATE]), async function (req, res, next) {
    try {
        const data = await LoanReceiptController.updateLoanReceiptById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put("/:id/extend", async function (req, res, next) {
    try {
        const data = await LoanReceiptController.extendLoanReceiptById(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/:keyword", checkPermission([ROLES.LOAN_RECEIPT_VIEW]), async function (req, res, next) {
    try {
        const data = await LoanReceiptController.getLoanReceiptByIdOrCode(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get("/", checkPermission([ROLES.LOAN_RECEIPT_VIEW]), async function (req, res, next) {
    try {
        const data = await LoanReceiptController.getLoanReceipts(req);
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
