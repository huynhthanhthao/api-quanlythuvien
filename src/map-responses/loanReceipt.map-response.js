const { LOAN_STATUS } = require("../../enums/common");
const { fDate } = require("../../utils/server");

module.exports.getBookStatus = function (receiptHasBook, bookLostReport) {
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
                bookName: receipt?.book?.bookName,
                bookStatusName: receipt?.bookStatus?.statusName || null,
                bookStatusId: receipt?.bookStatus?.id || null,
                photoURL: receipt?.book?.photoURL || null,
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
            fee: loanReceipt.fee,
            receiptDes: loanReceipt.receiptDes,
            createdAt: fDate(loanReceipt.createdAt),
            fullName: loanReceipt.user?.fullName || null,
            readerCode: loanReceipt.user?.readerCode || null,
            photoURL: loanReceipt.user?.photoURL || null,
            phone: loanReceipt.user?.phone || null,
            userId: loanReceipt.user?.id || null,
            email: loanReceipt.user?.email || null,
            bookList: module.exports.getBookStatus(loanReceipt?.receiptHasBook, loanReceipt?.bookLostReport),
        };
    });
};

module.exports.mapResponseLoanReceiptItem = function (loanReceipt) {
    return {
        id: loanReceipt.id,
        receiveDate: fDate(loanReceipt.receiveDate),
        returnDate: fDate(loanReceipt.returnDate),
        returnDate: loanReceipt.returnDate,
        fee: loanReceipt.fee,
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
            bookCode: receipt?.book?.bookCode || null,
            bookName: receipt?.book?.bookName,
            bookStatusName: receipt?.bookStatus?.statusName || null,
            bookStatusId: receipt?.bookStatus?.id || null,
            photoURL: receipt?.book?.photoURL || null,
        })),
    };
};
