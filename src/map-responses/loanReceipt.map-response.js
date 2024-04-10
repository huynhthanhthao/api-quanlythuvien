const { fDate, customerURL } = require("../../utils/server");

module.exports.getBookGroupStatus = function (receiptHasBook, bookLostReport) {
    return (
        receiptHasBook.map((receipt) => {
            return {
                bookId: receipt?.book?.id || null,
                type: receipt.type,
                bookCode: receipt?.book?.bookCode || null,
                bookName: receipt?.book?.bookGroup?.bookName,
                bookStatusName: receipt?.book?.status?.statusName || null,
                photoURL: customerURL(receipt?.book?.bookGroup?.photoURL) || null,
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
            photoURL: customerURL(loanReceipt.user?.photoURL) || null,
            phone: loanReceipt.user?.phone || null,
            userId: loanReceipt.user?.id || null,
            email: loanReceipt.user?.email || null,
            extensionHistory:
                loanReceipt?.extensionHistory?.map((history) => ({
                    returnDate: fDate(history?.returnDate),
                    createdAt: fDate(history?.createdAt),
                })) || [],
            bookList: module.exports.getBookGroupStatus(loanReceipt?.receiptHasBook, loanReceipt?.bookLostReport),
        };
    });
};

module.exports.mapResponseLoanReceiptItem = function (loanReceipt) {
    return {
        id: loanReceipt.id,
        receiptCode: loanReceipt.receiptCode,
        receiveDate: fDate(loanReceipt.receiveDate),
        returnDate: fDate(loanReceipt.returnDate),
        receiptDes: loanReceipt.receiptDes,
        createdAt: fDate(loanReceipt.createdAt),
        userId: loanReceipt.user?.id || null,
        fullName: loanReceipt.user?.fullName || null,
        readerCode: loanReceipt.user?.readerCode || null,
        photoURL: customerURL(loanReceipt.user?.photoURL) || null,
        phone: loanReceipt.user?.phone || null,
        email: loanReceipt.user?.email || null,
        bookList: loanReceipt?.receiptHasBook?.map((receipt) => ({
            bookId: receipt?.book?.id || null,
            type: receipt.type || null,
            loanFee: receipt.loanFee || 0,
            bookCode: receipt?.book?.bookCode || null,
            bookName: receipt?.book?.bookGroup?.bookName || null,
            bookStatusName: receipt?.book?.status?.statusName || null,
            photoURL: customerURL(receipt?.book?.bookGroup?.photoURL) || null,
        })),
    };
};
