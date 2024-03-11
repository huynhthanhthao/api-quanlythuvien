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
            detailTicket: penaltyTicket?.detailPenaltyTicket?.map((ticket) => ({
                bookId: ticket?.book?.id || null,
                bookCondition: ticket?.book?.bookCondition || null,
                bookCode: ticket?.book?.bookCode || null,
                bookName: ticket?.book?.bookName || null,
                bookDes: ticket?.book?.bookDes || null,
                otherName: ticket?.book?.otherName || null,
                author: ticket?.book?.author || null,
                pages: ticket?.book?.pages || null,
                yearPublication: ticket?.book?.yearPublication || null,
                rePublic: ticket?.book?.rePublic || null,
                price: ticket?.book?.price || null,
                photoURL: ticket?.book?.photoURL || null,
                quantity: ticket?.book?.quantity || null,
                finePolicyId: ticket?.finePolicy?.id || null,
                policyCode: ticket?.finePolicy?.policyCode || null,
                fineAmount: ticket?.finePolicy?.fineAmount || 0,
                dayLate: ticket?.finePolicy?.dayLate || null,
                realityDayLate: ticket?.realityDayLate || null,
                overdueFine: ticket?.finePolicy?.overdueFine || 0,
                policyDes: ticket?.finePolicy?.policyDes || null,
                policyName: ticket?.finePolicy?.policyDes || null,
                actualFee:
                    ticket?.realityDayLate <= ticket?.finePolicy?.dayLate
                        ? ticket?.finePolicy?.fineAmount
                        : ticket?.finePolicy?.fineAmount +
                          (ticket?.realityDayLate - ticket?.finePolicy?.dayLate) * ticket?.finePolicy?.overdueFine,
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
              detailTicket: penaltyTicket?.detailPenaltyTicket?.map((ticket) => ({
                  bookId: ticket?.book?.id || null,
                  bookCondition: ticket?.book?.bookCondition || null,
                  bookCode: ticket?.book?.bookCode || null,
                  bookName: ticket?.book?.bookName || null,
                  bookDes: ticket?.book?.bookDes || null,
                  otherName: ticket?.book?.otherName || null,
                  author: ticket?.book?.author || null,
                  pages: ticket?.book?.pages || null,
                  yearPublication: ticket?.book?.yearPublication || null,
                  rePublic: ticket?.book?.rePublic || null,
                  price: ticket?.book?.price || null,
                  photoURL: ticket?.book?.photoURL || null,
                  quantity: ticket?.book?.quantity || null,
                  finePolicyId: ticket?.finePolicy?.id || null,
                  policyCode: ticket?.finePolicy?.policyCode || null,
                  fineAmount: ticket?.finePolicy?.fineAmount || 0,
                  dayLate: ticket?.finePolicy?.dayLate || null,
                  realityDayLate: ticket?.realityDayLate || null,
                  overdueFine: ticket?.finePolicy?.overdueFine || 0,
                  policyDes: ticket?.finePolicy?.policyDes || null,
                  policyName: ticket?.finePolicy?.policyName || null,
                  actualFee:
                      ticket?.realityDayLate <= ticket?.finePolicy?.dayLate
                          ? ticket?.finePolicy?.fineAmount
                          : ticket?.finePolicy?.fineAmount +
                            (ticket?.realityDayLate - ticket?.finePolicy?.dayLate) * ticket?.finePolicy?.overdueFine,
              })),
          }
        : null;
};
