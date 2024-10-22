const { DEFAULT_REGULAR_BORROW_COUNT } = require("../../enums/common");
const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseBorrowReturnReport = function (dataList) {
    const result = Array.from({ length: 12 }, (_, monthIndex) => ({
        month: monthIndex + 1,
        dataBorrow: [],
    }));

    dataList.forEach((data) => {
        const borrowedMonth = data?.loanReceipt?.receiveDate?.getMonth() + 1;

        result[borrowedMonth - 1].dataBorrow.push({
            id: data.id,
            type: data.type,
            receiveDate: fDate(data.loanReceipt.receiveDate),
            returnDate: fDate(data.loanReceipt.returnDate),
        });
    });

    return result;
};

module.exports.mapResponseReaderReport = function (dataList, year) {
    const result = [];
    const currentMonth = new Date().getMonth() + 1;

    for (let month = 1; month <= currentMonth; month++) {
        let dataInMonth = { month, totalReaders: 0, totalNewReaders: 0, regularReaders: [] };

        dataList.map((data) => {
            let createdAt = data?.createdAt?.getMonth() + 1;

            if (createdAt == month) {
                dataInMonth.totalNewReaders += 1;
            }

            if (createdAt <= month) {
                dataInMonth.totalReaders += 1;
            }

            const loanReceiptCountInMonth = module.exports.countBorrowsInMonth(data.loanReceiptList, month, year);

            if (loanReceiptCountInMonth >= DEFAULT_REGULAR_BORROW_COUNT) {
                dataInMonth.regularReaders.push({
                    fullName: data.fullName,
                    readerCode: data.readerCode,
                    photoURL: data.photoURL,
                    phone: data.phone,
                    groupName: data?.readerGroup?.groupName,
                    quantityLimit: data?.readerGroup?.quantityLimit,
                    timeLimit: data?.readerGroup?.timeLimit,
                    borrowCountInMonth: loanReceiptCountInMonth,
                });
            }
        });

        dataInMonth.regularReaders.sort((a, b) => b.borrowCountInMonth - a.borrowCountInMonth).slice(0, 10);

        result.push(dataInMonth);
    }
    return result;
};

module.exports.countBorrowsInMonth = function (data, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return data.filter((item) => {
        const receiveDate = new Date(item.receiveDate);

        return receiveDate >= startDate && receiveDate < endDate;
    }).length;
};

module.exports.mapResponseGetMostBorrowedBooksReport = function (data) {
    return data.map((item) => ({
        id: item.id,
        bookName: item?.dataValues?.bookName || null,
        bookCode: item?.dataValues?.bookCode || null,
        totalLoans: item?.dataValues?.totalLoans || null,
        photoURL: customerURL(item?.dataValues?.photoURL) || null,
        author: item?.dataValues?.author || null,
        categoryName: item?.dataValues?.categoryName || null,
    }));
};

module.exports.mapResponseLoanReceiptReport = function (data) {
    return data.map((item) => ({
        fullName: item?.fullName || null,
        readerCode: item?.readerCode || null,
        photoURL: customerURL(item?.dataValues?.photoURL) || null,
        phone: item?.dataValues?.phone || null,
        totalLoans: item?.dataValues?.totalLoans || null,
    }));
};
