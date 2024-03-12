const { fDate } = require("../../utils/server");

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
            receiveDate: data.loanReceipt.receiveDate,
            returnDate: data.loanReceipt.returnDate,
        });
    });

    return result;
};
