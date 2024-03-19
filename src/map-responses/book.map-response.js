const { fDate } = require("../../utils/server");

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
            photoURL: book.photoURL,
            penaltyApplied: book.penaltyApplied,
            createdAt: fDate(book.createdAt),
            categoryName: book.category?.categoryName || null,
            pubName: book.publisher?.pubName || null,
            positionName: book.position?.positionName || null,
            lanName: book.language?.lanName || null,
            fieldList: book.fieldHasBook?.map((item) => item?.field?.fieldName) || [],
            detailQuantity:
                book.bookHasStatus?.map((item) => ({
                    statusName: item?.status?.statusName || null,
                    statusId: item?.status?.id || null,
                    quantity: item?.quantity || 0,
                })) || [],
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
              photoURL: book.photoURL,
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
              detailQuantity:
                  book.bookHasStatus?.map((item) => ({
                      statusName: item?.status?.statusName || null,
                      statusId: item?.status?.id || null,
                      quantity: item?.quantity || null,
                  })) || [],
          }
        : null;
};
