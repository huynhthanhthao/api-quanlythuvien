const bookingBookHtml = (data) => {
    return `<p>Nhấn vào đây để xác nhận. ${data?.school?.schoolDomain} - ${data.token} </p>`;
};

module.exports = { bookingBookHtml };
