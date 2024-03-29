const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseBookList = function (bookList) {
    return bookList.map((book) => {
        return {
            id: book.id,
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
            lanName: book.language?.lanName || null,
            fieldList: book.fieldHasBook?.map((item) => item?.field?.fieldName) || [],
            attachFiles: book?.attachFiles?.map((file) => ({
                fileName: file.fileName,
                fileURL: customerURL(file.fileURL),
            })),
            detailBooks: book?.detailBooks?.map((book) => ({
                bookCode: book.bookCode || null,
                statusName: book?.status?.statusName || null,
                positionName: book?.position?.positionName || null,
            })),
        };
    });
};

module.exports.mapResponseBookItem = function (book) {
    return book
        ? {
              id: book.id,
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
              penaltyApplied: book.penaltyApplied,
              createdAt: fDate(book.createdAt),
              categoryName: book.category?.categoryName || null,
              categoryId: book.category?.id || null,
              pubName: book.publisher?.pubName || null,
              pubId: book.publisher?.id || null,
              lanName: book.language?.lanName || null,
              lanId: book.language?.id || null,
              fieldList: book.fieldHasBook?.map((item) => item?.field?.id) || [],
              attachFiles: book?.attachFiles?.map((file) => ({
                  fileName: file.fileName,
                  fileURL: customerURL(file.fileURL),
              })),
              detailBooks: book?.detailBooks?.map((book) => ({
                  bookCode: book.bookCode || null,
                  statusName: book?.status?.statusName || null,
                  statusId: book?.status?.id || null,
                  positionName: book?.position?.positionName || null,
                  positionId: book?.position?.id || null,
              })),
          }
        : null;
};

// module.exports.mapResponseBookByCode = function (book) {
//     return book
//         ? {
//             id:
//           }
//         : null;
// };
