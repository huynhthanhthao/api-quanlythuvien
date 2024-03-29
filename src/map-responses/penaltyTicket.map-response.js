const { fDate } = require("../../utils/server");

module.exports.mapResponsePenaltyTicketList = function (penaltyTicketList) {
    return penaltyTicketList.map((penaltyTicket) => {
        return {
            id: penaltyTicket.id,
            ticketCode: penaltyTicket.ticketCode,
            status: penaltyTicket.status,
            createdAt: fDate(penaltyTicket.createdAt),
            fullName: penaltyTicket?.user?.fullName,
            userPhotoURL: penaltyTicket?.user?.photoURL || null,
            phone: penaltyTicket?.user?.phone || null,
            readerCode: penaltyTicket?.user?.readerCode || null,
            email: penaltyTicket?.user?.email || null,
            detailTicket: penaltyTicket?.detailPenaltyTicket?.map((ticket) => ({
                bookId: ticket?.book?.id || null,
                bookCode: ticket?.book?.bookCode || null,
                bookName: ticket?.book?.bookGroup?.bookName || null,
                bookDes: ticket?.book?.bookGroup?.bookDes || null,
                otherName: ticket?.book?.bookGroup?.otherName || null,
                author: ticket?.book?.bookGroup?.author || null,
                pages: ticket?.book?.bookGroup?.pages || null,
                yearPublication: ticket?.bookGroup?.book?.yearPublication || null,
                rePublic: ticket?.book?.bookGroup?.rePublic || null,
                price: ticket?.book?.bookGroup?.price || 0,
                photoURL: ticket?.book?.bookGroup?.photoURL || null,
                realityDayLate: ticket?.realityDayLate || 0,
                penaltyFee: ticket?.penaltyFee || 0,
            })),
        };
    });
};

module.exports.mapResponsePenaltyTicketItem = function (penaltyTicket) {
    return penaltyTicket
        ? {
              id: penaltyTicket.id,
              ticketCode: penaltyTicket.ticketCode,
              status: penaltyTicket.status,
              createdAt: penaltyTicket.createdAt,
              fullName: penaltyTicket?.user?.fullName,
              userPhotoURL: penaltyTicket?.user?.photoURL || null,
              phone: penaltyTicket?.user?.phone || null,
              readerCode: penaltyTicket?.user?.readerCode || null,
              email: penaltyTicket?.user?.email || null,
              detailTicket: penaltyTicket?.detailPenaltyTicket?.map((ticket) => ({
                  bookId: ticket?.book?.id || null,
                  bookCode: ticket?.book?.bookCode || null,
                  bookName: ticket?.book?.bookName || null,
                  bookDes: ticket?.book?.bookDes || null,
                  otherName: ticket?.book?.otherName || null,
                  author: ticket?.book?.author || null,
                  pages: ticket?.book?.pages || null,
                  yearPublication: ticket?.book?.yearPublication || null,
                  rePublic: ticket?.book?.rePublic || null,
                  price: ticket?.book?.price || 0,
                  photoURL: ticket?.book?.photoURL || null,
                  realityDayLate: ticket?.realityDayLate || 0,
                  penaltyFee: ticket?.penaltyFee || 0,
              })),
          }
        : null;
};
