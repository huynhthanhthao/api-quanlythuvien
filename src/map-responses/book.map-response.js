const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseBookGroupList = function (bookGroupList) {
    return bookGroupList.map((bookGroup) => {
        return {
            id: bookGroup.id,
            bookName: bookGroup.bookName,
            bookDes: bookGroup.bookDes,
            otherName: bookGroup.otherName,
            author: bookGroup.author,
            pages: bookGroup.pages,
            slug: bookGroup.slug,
            yearPublication: bookGroup.yearPublication,
            rePublic: bookGroup.rePublic,
            price: bookGroup.price,
            loanFee: bookGroup.loanFee,
            photoURL: customerURL(bookGroup.photoURL),
            penaltyApplied: bookGroup.penaltyApplied,
            borrowFeeApplied: bookGroup.borrowFeeApplied,
            createdAt: fDate(bookGroup.createdAt),
            categoryName: bookGroup.category?.categoryName || null,
            pubName: bookGroup.publisher?.pubName || null,
            lanName: bookGroup.language?.lanName || null,
            fieldList: bookGroup.fieldHasBook?.map((item) => item?.field?.fieldName) || [],
            attachFiles: bookGroup?.attachFiles?.map((file) => ({
                fileName: file.fileName,
                fileURL: customerURL(file.fileURL),
            })),
            detailBooks: bookGroup?.detailBooks?.map((book) => ({
                bookId: book.id || null,
                bookCode: book.bookCode || null,
                statusName: book?.status?.statusName || null,
                positionName: book?.position?.positionName || null,
                isReady: book?.receiptHasBook?.length > 0 || book?.bookingHasBook?.length > 0 ? false : true || false,
            })),
        };
    });
};

module.exports.mapResponseBookGroupItem = function (bookGroup) {
    return bookGroup
        ? {
              id: bookGroup.id,
              bookName: bookGroup.bookName,
              bookDes: bookGroup.bookDes,
              otherName: bookGroup.otherName,
              author: bookGroup.author,
              pages: bookGroup.pages,
              slug: bookGroup.slug,
              loanFee: bookGroup.loanFee,
              yearPublication: bookGroup.yearPublication,
              rePublic: bookGroup.rePublic,
              price: bookGroup.price,
              photoURL: customerURL(bookGroup.photoURL),
              penaltyApplied: bookGroup.penaltyApplied,
              borrowFeeApplied: bookGroup.borrowFeeApplied,
              createdAt: fDate(bookGroup.createdAt),
              categoryName: bookGroup.category?.categoryName || null,
              categoryId: bookGroup.category?.id || null,
              pubName: bookGroup.publisher?.pubName || null,
              pubId: bookGroup.publisher?.id || null,
              lanName: bookGroup.language?.lanName || null,
              lanId: bookGroup.language?.id || null,
              fieldList: bookGroup.fieldHasBook?.map((item) => item?.field?.id) || [],
              attachFiles: bookGroup?.attachFiles?.map((file) => ({
                  fileName: file.fileName,
                  fileURL: customerURL(file.fileURL),
              })),
              detailBooks: bookGroup?.detailBooks?.map((book) => ({
                  bookCode: book.bookCode || null,
                  bookId: book.id || null,
                  statusName: book?.status?.statusName || null,
                  statusId: book?.status?.id || null,
                  positionName: book?.position?.positionName || null,
                  positionId: book?.position?.id || null,
              })),
          }
        : null;
};

module.exports.mapResponseBookItem = function (book) {
    return book
        ? {
              id: book.id,
              status: book?.status?.statusName || null,
              statusId: book?.status?.id || null,
              positionName: book.position?.positionName || null,
              positionId: book.position?.id || null,
              bookCode: book.bookCode,
              bookName: book?.bookGroup?.bookName || null,
              bookDes: book?.bookGroup?.bookDes || null,
              otherName: book?.bookGroup?.otherName || null,
              author: book?.bookGroup?.author || null,
              pages: book?.bookGroup?.pages || null,
              loanFee: book?.bookGroup?.loanFee || null,
              yearPublication: book?.bookGroup?.yearPublication || null,
              rePublic: book?.bookGroup?.rePublic || null,
              price: book?.bookGroup?.price || null,
              photoURL: customerURL(book?.bookGroup?.photoURL) || null,
              penaltyApplied: book?.bookGroup?.penaltyApplied || null,
              createdAt: fDate(book?.bookGroup?.createdAt) || null,
              categoryName: book?.bookGroup?.category?.categoryName || null,
              categoryId: book?.bookGroup?.category?.id || null,
              pubName: book?.bookGroup?.publisher?.pubName || null,
              pubId: book?.bookGroup?.publisher?.id || null,
              lanName: book?.bookGroup?.language?.lanName || null,
              lanId: book?.bookGroup?.language?.id || null,
              fieldList:
                  book?.bookGroup?.fieldHasBook?.map((item) => ({
                      fieldId: item?.field?.id,
                      fieldName: item?.field?.fieldName,
                  })) || [],
              attachFiles: book?.bookGroup?.attachFiles?.map((file) => ({
                  fileName: file.fileName,
                  fileURL: customerURL(file.fileURL),
              })),
          }
        : null;
};

module.exports.mapResponseBookList = function (bookList) {
    return bookList.map((book) => ({
        id: book.id,
        status: book?.status?.statusName || null,
        statusId: book?.status?.id || null,
        positionName: book.position?.positionName || null,
        positionId: book.position?.id || null,
        bookCode: book.bookCode,
        bookName: book?.bookGroup?.bookName || null,
        bookDes: book?.bookGroup?.bookDes || null,
        otherName: book?.bookGroup?.otherName || null,
        author: book?.bookGroup?.author || null,
        pages: book?.bookGroup?.pages || null,
        loanFee: book?.bookGroup?.loanFee || null,
        slug: book?.bookGroup?.slug || null,
        yearPublication: book?.bookGroup?.yearPublication || null,
        rePublic: book?.bookGroup?.rePublic || null,
        price: book?.bookGroup?.price || null,
        photoURL: customerURL(book?.bookGroup?.photoURL) || null,
        penaltyApplied: book?.bookGroup?.penaltyApplied || null,
        createdAt: fDate(book?.bookGroup?.createdAt) || null,
        categoryName: book?.bookGroup?.category?.categoryName || null,
        categoryId: book?.bookGroup?.category?.id || null,
        pubName: book?.bookGroup?.publisher?.pubName || null,
        pubId: book?.bookGroup?.publisher?.id || null,
        lanName: book?.bookGroup?.language?.lanName || null,
        lanId: book?.bookGroup?.language?.id || null,
        isReady: book?.receiptHasBook?.length > 0 || book?.bookingHasBook?.length > 0 ? false : true || false,
        fieldList:
            book?.bookGroup?.fieldHasBook?.map((item) => ({
                fieldId: item?.field?.id,
                fieldName: item?.field?.fieldName,
            })) || [],
        attachFiles: book?.bookGroup?.attachFiles?.map((file) => ({
            fileName: file.fileName,
            fileURL: customerURL(file.fileURL),
        })),
    }));
};

module.exports.mapResponseBookGroupListPublic = function (bookGroupList) {
    return bookGroupList.map((bookGroup) => {
        return {
            id: bookGroup.id,
            bookName: bookGroup.bookName,
            bookDes: bookGroup.bookDes,
            otherName: bookGroup.otherName,
            author: bookGroup.author,
            pages: bookGroup.pages,
            slug: bookGroup.slug,
            yearPublication: bookGroup.yearPublication,
            rePublic: bookGroup.rePublic,
            price: bookGroup.price,
            loanFee: bookGroup.loanFee,
            photoURL: customerURL(bookGroup.photoURL),
            penaltyApplied: bookGroup.penaltyApplied,
            createdAt: fDate(bookGroup.createdAt),
            categoryName: bookGroup.category?.categoryName || null,
            pubName: bookGroup.publisher?.pubName || null,
            lanName: bookGroup.language?.lanName || null,
            fieldList: bookGroup.fieldHasBook?.map((item) => item?.field?.fieldName) || [],
            attachFiles: bookGroup?.attachFiles?.map((file) => ({
                fileName: file.fileName,
                fileURL: customerURL(file.fileURL),
            })),
            detailBooks: bookGroup?.detailBooks?.map((book) => ({
                bookId: book.id || null,
                bookCode: book.bookCode || null,
                statusName: book?.status?.statusName || null,
                positionName: book?.position?.positionName || null,
                isReady: book?.receiptHasBook?.length > 0 || book?.bookingHasBook?.length > 0 ? false : true || false,
            })),
        };
    });
};

module.exports.mapResponseBookGroupItemPublic = function (bookGroup) {
    return {
        id: bookGroup.id,
        bookName: bookGroup.bookName,
        bookDes: bookGroup.bookDes,
        otherName: bookGroup.otherName,
        author: bookGroup.author,
        pages: bookGroup.pages,
        slug: bookGroup.slug,
        yearPublication: bookGroup.yearPublication,
        rePublic: bookGroup.rePublic,
        price: bookGroup.price,
        loanFee: bookGroup.loanFee,
        photoURL: customerURL(bookGroup.photoURL),
        penaltyApplied: bookGroup.penaltyApplied,
        createdAt: fDate(bookGroup.createdAt),
        categoryName: bookGroup.category?.categoryName || null,
        pubName: bookGroup.publisher?.pubName || null,
        lanName: bookGroup.language?.lanName || null,
        fieldList: bookGroup.fieldHasBook?.map((item) => item?.field?.fieldName) || [],
        attachFiles: bookGroup?.attachFiles?.map((file) => ({
            fileName: file.fileName,
            fileURL: customerURL(file.fileURL),
        })),
        detailBooks: bookGroup?.detailBooks?.map((book) => ({
            bookId: book.id || null,
            bookCode: book.bookCode || null,
            statusName: book?.status?.statusName || null,
            positionName: book?.position?.positionName || null,
            isReady: book?.receiptHasBook?.length > 0 || book?.bookingHasBook?.length > 0 ? false : true || false,
        })),
    };
};
