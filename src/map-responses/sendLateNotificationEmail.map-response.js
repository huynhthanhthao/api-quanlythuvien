module.exports.mapResponseNotificationEmailBookLate = function (userList) {
    return userList.map((user) => {
        const bookList = [];
        for (const loanReceipt of user.loanReceiptList || []) {
            let loanData = { receiveDate: loanReceipt.receiveDate, returnDate: loanReceipt.returnDate };

            for (const receipt of loanReceipt?.receiptHasBook || []) {
                let book = {
                    ...loanData,
                    bookName: receipt?.book?.bookGroup?.bookName,
                    bookCode: receipt?.book?.bookCode,
                    author: receipt?.book?.bookGroup?.author,
                };

                bookList.push(book);
            }
        }
        return {
            fullName: user.fullName,
            readerCode: user.readerCode,
            email: user.email,
            schoolName: user?.school?.schoolName,
            schoolId: user?.school?.id,
            logo: user?.school?.logo,
            bookList,
        };
    });
};
