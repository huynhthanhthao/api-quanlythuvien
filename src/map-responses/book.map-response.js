const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseBookList = function (bookList) {
    return bookList.map((book) => {
        return {
            id: book.id,
            bookCode: book.bookCode,
            bookName: book.bookName,
            bookDes: book.bookDes,
            otherName: book.otherName,
            author: book.author,
            pages: book.pages,
            yearPublication: book.yearPublication,
            rePublic: book.rePublic,
            price: book.price,
            loanFee: book.loanFee,
            photoURL: customerURL(book.photoURL),
            penaltyApplied: book.penaltyApplied,
            createdAt: fDate(book.createdAt),
            categoryName: book.category?.categoryName || null,
            pubName: book.publisher?.pubName || null,
            positionName: book.position?.positionName || null,
            lanName: book.language?.lanName || null,
            fieldList: book.fieldHasBook?.map((item) => item?.field?.fieldName) || [],
            status: book?.status?.statusName || null,
            attachFiles: book?.attachFiles?.map((file) => ({
                fileName: file.fileName,
                fileURL: customerURL(file.fileURL),
            })),
        };
    });
};

module.exports.mapResponseBookItem = function (book) {
    return book
        ? {
              id: book.id,
              bookCode: book.bookCode,
              bookName: book.bookName,
              bookDes: book.bookDes,
              otherName: book.otherName,
              author: book.author,
              pages: book.pages,
              loanFee: book.loanFee,
              yearPublication: book.yearPublication,
              rePublic: book.rePublic,
              price: book.price,
              photoURL: customerURL(book.photoURL),
              bookCondition: book.bookCondition,
              penaltyApplied: book.penaltyApplied,
              createdAt: fDate(book.createdAt),
              categoryName: book.category?.categoryName || null,
              categoryId: book.category?.id || null,
              pubName: book.publisher?.pubName || null,
              pubId: book.publisher?.id || null,
              positionName: book.position?.positionName || null,
              positionId: book.position?.id || null,
              lanName: book.language?.lanName || null,
              lanId: book.language?.id || null,
              fieldList: book.fieldHasBook?.map((item) => item?.field?.id) || [],
              status: book?.status?.statusName || null,
              statusId: book?.status?.id || null,
              attachFiles: book?.attachFiles?.map((file) => ({
                  fileName: file.fileName,
                  fileURL: customerURL(file.fileURL),
              })),
          }
        : null;
};
