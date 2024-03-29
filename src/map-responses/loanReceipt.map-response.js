const { LOAN_STATUS } = require("../../enums/common");
const { fDate } = require("../../utils/server");

module.exports.getBookGroupStatus = function (receiptHasBook, bookLostReport) {
    const lostBookIds = [];

    for (const bookLost of bookLostReport) {
        bookLost.lostReportHasBook?.forEach((item) => {
            lostBookIds.push(+item.bookId);
        });
    }

    return (
        receiptHasBook.map((receipt) => {
            return {
                bookId: receipt?.book?.id || null,
                type: lostBookIds.includes(+receipt?.book?.id) ? LOAN_STATUS.LOST : receipt.type,
                bookCode: receipt?.book?.bookCode || null,
                bookName: receipt?.book?.bookGroup?.bookName,
                bookStatusName: receipt?.book?.status?.statusName || null,
                photoURL: receipt?.book?.bookGroup?.photoURL || null,
                loanFee: receipt.loanFee || 0,
            };
        }) || []
    );
};

module.exports.mapResponseLoanReceiptList = function (loanReceiptList) {
    return loanReceiptList.map((loanReceipt) => {
        return {
            id: loanReceipt.id,
            receiptCode: loanReceipt.receiptCode,
            receiveDate: fDate(loanReceipt.receiveDate),
            returnDate: fDate(loanReceipt.returnDate),
            receiptDes: loanReceipt.receiptDes,
            createdAt: fDate(loanReceipt.createdAt),
            fullName: loanReceipt.user?.fullName || null,
            readerCode: loanReceipt.user?.readerCode || null,
            photoURL: loanReceipt.user?.photoURL || null,
            phone: loanReceipt.user?.phone || null,
            userId: loanReceipt.user?.id || null,
            email: loanReceipt.user?.email || null,
            bookList: module.exports.getBookGroupStatus(loanReceipt?.receiptHasBook, loanReceipt?.bookLostReport),
        };
    });
};

module.exports.mapResponseLoanReceiptItem = function (loanReceipt) {
    return {
        id: loanReceipt.id,
        receiveDate: fDate(loanReceipt.receiveDate),
        returnDate: fDate(loanReceipt.returnDate),
        receiptCode: loanReceipt.receiptCode,
        receiptDes: loanReceipt.receiptDes,
        createdAt: fDate(loanReceipt.createdAt),
        userId: loanReceipt.user?.id || null,
        fullName: loanReceipt.user?.fullName || null,
        readerCode: loanReceipt.user?.readerCode || null,
        photoURL: loanReceipt.user?.photoURL || null,
        phone: loanReceipt.user?.phone || null,
        email: loanReceipt.user?.email || null,
        bookList: loanReceipt?.receiptHasBook?.map((receipt) => ({
            bookId: receipt?.book?.id || null,
            type: receipt.type || null,
            loanFee: receipt.loanFee || 0,
            bookCode: receipt?.book?.bookCode || null,
            bookName: receipt?.book?.bookName,
            bookStatusName: receipt?.book?.status?.statusName || null,
            photoURL: receipt?.book?.photoURL || null,
        })),
    };
};
