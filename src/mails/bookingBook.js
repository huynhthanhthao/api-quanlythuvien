const { convertDateVi } = require("../../utils/server");

const bookingBookHtml = (data) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XÁC NHẬN ĐẶT TRƯỚC MƯỢN SÁCH</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px 20%;
        background-color: #f4f4f4;
      }
      .confirmation-form {
        background-color: #fff;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: center; /* Cho tất cả nội dung ở giữa */
        width: 100%; /* Chiều rộng cố định cho form */
        max-width: 600px; /* Giới hạn chiều rộng tối đa */
        margin: auto; /* Căn giữa form */
      }
      .header {
      
      }
      .header img {
        max-width: 70px;
      }
      .header h2 {
        margin: 0;
      }
      .title {
        font-size: 24px;
        font-weight: bold; /* In đậm tiêu đề */
        margin-bottom: 10px;
      }
      .message {
        margin-bottom: 20px;
        font-size: 16px
      }
      .reader-info {
        margin-bottom: 20px;
        font-size: 16px;
        text-align: left; /* Căn trái thông tin bạn đọc */
      }
      .book-list-title {
        text-align: left;
        font-size: 16px;
        margin-top: 20px;
        font-weight: bold;
      }
      .book-list {
        margin-bottom: 20px;
        text-align: left; /* Căn trái danh sách ấn phẩm */
      }
      .book-item {
        border-bottom: 1px solid #ddd;
        padding: 10px 0;
      }
      .book-title {
        margin-bottom: 5px;
      }
      .btn-confirm {
        display: inline-block; 
        background-color: #44576b;
        color: white;
        padding: 10px 20px;
        text-align: center;
    
        margin-bottom: 10px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
      }
      .contact-info {
        font-style: italic;
      }
    </style>
    </head>
    <body>
    <div class="confirmation-form">
    <table class="header" style="width:100%;margin-bottom: 15px;border: none;border-bottom: 1px;border-color: #333;border-bottom-style: solid;padding-bottom: 12px;" cellpadding="0" cellspacing="0">
    <tbody>
        <tr>
            <td align="left" style="width: 50%;">
                <img src="${data.school.logo}" alt="Logo Trường" style="max-height: 70px; width: 100%;">
            </td>
            <td align="right" style="width: 50%;">
                <h2 style="margin: 0;">${data.school.schoolName}</h2>
            </td>
        </tr>
    </tbody>
    </table>
      <div class="title">
        XÁC NHẬN ĐẶT TRƯỚC MƯỢN SÁCH
      </div>
      <div class="message">
    Mã đặt trước: <strong>${data.bookingForm?.formCode}</strong><br>
        Ngày nhận ấn phẩm: <strong>${convertDateVi(data.bookingForm?.receiveDate)}</strong>
      </div>
      <div class="reader-info">
        <div>Mã bạn đọc: <strong>${data.user?.readerCode}</strong></div>
        <div>Tên bạn đọc: <strong>${data.user?.fullName}</strong></div>
      </div>
      <div class="book-list-title">
        Danh sách ấn phẩm:
      </div>
      <div class="book-list">
        <!-- Danh sách ấn phẩm -->
        ${data.books?.map(
            (book) => ` 
            <div class="book-item">
                <div class="book-title" style="font-size:16px">${book?.dataValues?.bookName}</div>
                <div style="font-size:16px">Tác Giả: ${book?.dataValues?.author}</div>
             </div>`
        )}
      </div>
      
      <a class="btn-confirm" style="color: #fff !important" href="${data.school?.schoolDomain}/${
        data.token
    }">XÁC NHẬN</a>
      <div class="contact-info">
        Nếu có thắc mắc, vui lòng liên hệ trực tiếp với thư viện để được giải đáp & hỗ trợ.
      </div>
    </div>
    </body>
    </html>
    `;
};

module.exports = { bookingBookHtml };
