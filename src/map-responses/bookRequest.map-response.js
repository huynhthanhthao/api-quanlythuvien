const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseBookRequestList = function (bookList) {
    return bookList.map((book) => {
        return {
            id: book.id,
            bookName: book.bookName,
            bookCode: book.bookCode,
            requestDate: fDate(book.requestDate),
            otherName: book.otherName,
            bookDes: book.bookDes,
            author: book.author,
            photoURL: customerURL(book.photoURL),
            rePublic: book.rePublic,
            yearPublication: book.yearPublication,
            createdAt: fDate(book.createdAt),
            categoryName: book.category?.categoryName || null,
            pubName: book.publisher?.pubName || null,
            lanName: book.language?.lanName || null,
        };
    });
};

module.exports.mapResponseBookRequestItem = function (book) {
    return book
        ? {
              id: book.id,
              bookName: book.bookName,
              bookCode: book.bookCode,
              requestDate: fDate(book.requestDate),
              otherName: book.otherName,
              bookDes: book.bookDes,
              author: book.author,
              photoURL: customerURL(book.photoURL),
              rePublic: book.rePublic,
              yearPublication: book.yearPublication,
              createdAt: fDate(book.createdAt),
              categoryName: book.category?.categoryName || null,
              categoryId: book.category?.id || null,
              pubName: book.publisher?.pubName || null,
              pubId: book.publisher?.id || null,
              lanName: book.language?.lanName || null,
              lanId: book.language?.id || null,
          }
        : null;
};
