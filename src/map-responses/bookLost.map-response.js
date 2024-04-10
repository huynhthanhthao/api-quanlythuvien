const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseBookLostList = function (bookLostList) {
    return bookLostList.map((bookLost) => {
        return {
            id: bookLost.id,
            loanReceiptId: bookLost.loanReceiptId,
            reportDes: bookLost.reportDes,
            createdAt: bookLost.createdAt,
            receiptCode: bookLost?.loanReceipt?.receiptCode || null,
            receiveDate: fDate(bookLost?.loanReceipt?.receiveDate) || null,
            returnDate: fDate(bookLost?.loanReceipt?.returnDate) || null,
            userId: bookLost?.loanReceipt?.user?.id || null,
            fullName: bookLost?.loanReceipt?.user?.fullName || null,
            readerCode: bookLost?.loanReceipt?.user?.readerCode || null,
            photoURL: customerURL(bookLost?.loanReceipt?.user?.photoURL) || null,
            phone: bookLost?.loanReceipt?.user?.phone || null,
            address: bookLost?.loanReceipt?.user?.address || null,
            bookList: bookLost.lostReportHasBook?.map((item) => ({
                bookId: item?.book?.id || null,
                bookCode: item?.book?.bookCode || null,
                bookName: item?.book?.bookGroup?.bookName || null,
                otherName: item?.book?.bookGroup?.otherName || null,
                author: item?.book?.bookGroup?.author || null,
                price: item?.book?.bookGroup?.price || null,
                photoURL: customerURL(item?.book?.bookGroup?.photoURL) || null,
            })),
        };
    });
};

module.exports.mapResponseBookLostItem = function (bookLost) {
    return bookLost
        ? {
              id: bookLost.id,
              loanReceiptId: bookLost.loanReceiptId,
              reportDes: bookLost.reportDes,
              createdAt: bookLost.createdAt,
              receiptCode: bookLost?.loanReceipt?.receiptCode || null,
              receiveDate: fDate(bookLost?.loanReceipt?.receiveDate) || null,
              returnDate: fDate(bookLost?.loanReceipt?.returnDate) || null,
              userId: bookLost?.loanReceipt?.user?.id || null,
              fullName: bookLost?.loanReceipt?.user?.fullName || null,
              readerCode: bookLost?.loanReceipt?.user?.readerCode || null,
              photoURL: customerURL(bookLost?.loanReceipt?.user?.photoURL) || null,
              phone: bookLost?.loanReceipt?.user?.phone || null,
              address: bookLost?.loanReceipt?.user?.address || null,
              bookList: bookLost.lostReportHasBook?.map((item) => ({
                  bookId: item?.book?.id || null,
                  bookCode: item?.book?.bookCode || null,
                  bookName: item?.book?.bookGroup?.bookName || null,
                  otherName: item?.book?.bookGroup?.otherName || null,
                  author: item?.book?.bookGroup?.author || null,
                  price: item?.book?.bookGroup?.price || null,
                  photoURL: customerURL(item?.book?.bookGroup?.photoURL) || null,
              })),
          }
        : null;
};
