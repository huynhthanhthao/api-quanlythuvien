const { convertDateVi } = require("../../utils/server");

const notifyBookLate = (data) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>THÔNG BÁO SÁCH TRỄ HẠN</title>
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
            text-align: center;
            /* Cho tất cả nội dung ở giữa */
            width: 100%;
            /* Chiều rộng cố định cho form */
            max-width: 600px;
            /* Giới hạn chiều rộng tối đa */
            margin: auto;
            /* Căn giữa form */
          }
  
          .header {}
  
          .header img {
            max-width: 70px;
          }
  
          .header h2 {
            margin: 0;
          }
  
          .title {
            font-size: 24px;
            font-weight: bold;
            /* In đậm tiêu đề */
            margin-bottom: 10px;
          }
  
          .message {
            margin-bottom: 20px;
            font-size: 16px
          }
  
          .reader-info {
            margin-bottom: 20px;
            font-size: 16px;
            text-align: left;
            /* Căn trái thông tin bạn đọc */
          }
  
          .book-list-title {
            text-align: left;
            font-size: 16px;
            margin-top: 20px;
            font-weight: bold;
          }
  
          .book-list {
            margin-bottom: 20px;
            text-align: left;
            /* Căn trái danh sách ấn phẩm */
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
  
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 0.9em;
            min-width: 400px;
            overflow: hidden;
            box-shadow: 0 0 20px #e9e9e9;
          }
  
          thead tr {
            background-color: rgba(7, 141, 238, 1);
            color: #fff;
            text-align: left;
          }
  
          th,
          td {
            padding: 12px 15px;
          }

          th {
            text-align: center
          }
  
          tbody tr {
            border-bottom: 1px solid #e9e9e9;
          }
  
          tbody tr:nth-of-type(even) {
            background-color: #e9e9e9;
          }
  
          tbody tr:last-of-type {
            border-bottom: 1px solid rgba(7, 141, 238, 1);
          }
        </style>
      </head>
      <body>
        <div class="confirmation-form">
          <table class="header" style="width:100%;margin-bottom: 15px;border: none;border-bottom: 1px;border-color: #333;border-bottom-style: solid;padding-bottom: 12px;" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td align="left" style="width: 50%;">
                  <img src="${data.logo}" alt="Logo Trường" style="max-height: 70px; width: 100%;">
                </td>
                <td align="right" style="width: 50%;">
                  <h2 style="margin: 0;">${data.schoolName}</h2>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="title"> THÔNG BÁO MƯỢN SÁCH QUÁ HẠN </div>
          <div class="reader-info">
            <div>Mã bạn đọc: <strong>${data.readerCode}</strong>
            </div>
            <div style="margin-top: 10px">Tên bạn đọc: <strong>${data.fullName}</strong>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã Sách</th>
                <th>Tên Sách</th>
                <th>Ngày Mượn</th>
                <th>Ngày Trả</th>
              </tr>
            </thead>
            <tbody>
              ${data.bookList.map(
                  (book, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${book.bookCode}</td>
                  <td>${book.bookName} - ${book.author}</td>
                  <td>${convertDateVi(book.receiveDate)}</td>
                  <td>${convertDateVi(book.returnDate)}</td>
                </tr>
              `
              )}
            </tbody>
          </table>
          <div class="contact-info"> Đây là email tự động, nếu bạn đọc đã trả sách vui lòng bỏ qua email này. </div>
        </div>
      </body>
    </html>
    `;
};

module.exports = { notifyBookLate };
