const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseBookingFormList = function (bookingFormList) {
    return bookingFormList.map((bookingForm) => {
        return {
            id: bookingForm.id,
            userId: bookingForm.userId,
            formCode: bookingForm.formCode,
            receiveDate: fDate(bookingForm.receiveDate),
            isConfirmed: bookingForm.isConfirmed,
            bookingDes: bookingForm.bookingDes,
            token: bookingForm.token,
            fullName: bookingForm?.user?.fullName || null,
            photoURL: customerURL(bookingForm?.user?.photoURL) || null,
            phone: bookingForm?.user?.phone || null,
            birthday: fDate(bookingForm?.user?.birthday) || null,
            email: bookingForm?.user?.email || null,
            readerCode: bookingForm?.user?.readerCode || null,
        };
    });
};

module.exports.mapResponseBookingFormItem = function (bookingForm) {
    return bookingForm
        ? {
              id: bookingForm.id,
              userId: bookingForm.userId,
              formCode: bookingForm.formCode,
              receiveDate: fDate(bookingForm.receiveDate),
              isConfirmed: bookingForm.isConfirmed,
              bookingDes: bookingForm.bookingDes,
              token: bookingForm.token,
              fullName: bookingForm?.user?.fullName || null,
              photoURL: customerURL(bookingForm?.user?.photoURL) || null,
              phone: bookingForm?.user?.phone || null,
              birthday: fDate(bookingForm?.user?.birthday) || null,
              email: bookingForm?.user?.email || null,
              readerCode: bookingForm?.user?.readerCode || null,
          }
        : null;
};
