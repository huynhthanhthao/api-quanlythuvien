const { Op } = require("sequelize");
const db = require("../models");
const { LOAN_STATUS } = require("../../enums/common");
const { mapResponseNotificationEmailBookLate } = require("../map-responses/sendLateNotificationEmail.map-response");
const TransporterService = require("../services/transporter.service");
const { notifyBookLate } = require("../mails/notifyBookLate");
async function sendLateNotificationEmail() {
    const whereCondition = { active: true };
    const users = await db.User.findAll({
        where: { active: true },
        attributes: ["id", "fullName", "email", "readerCode"],
        include: [
            {
                model: db.School,
                as: "school",
                where: whereCondition,
                required: true,
                attributes: ["id", "schoolName", "logo"],
                include: [
                    {
                        model: db.SchoolEmailSMTP,
                        as: "schoolEmailSMTP",
                        where: { active: true },
                        required: false,
                        attributes: ["email", "password"],
                    },
                ],
            },
            {
                model: db.LoanReceipt,
                as: "loanReceiptList",
                where: { ...whereCondition, returnDate: { [Op.lt]: new Date() } },
                required: true,
                attributes: ["id", "receiveDate", "returnDate"],
                include: [
                    {
                        model: db.ReceiptHasBook,
                        as: "receiptHasBook",
                        where: { ...whereCondition, type: LOAN_STATUS.BORROWING },
                        required: true,
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Book,
                                as: "book",
                                where: whereCondition,
                                required: true,
                                attributes: ["bookCode"],
                                include: [
                                    {
                                        model: db.BookGroup,
                                        as: "bookGroup",
                                        where: whereCondition,
                                        required: true,
                                        attributes: ["bookName", "author"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    });
    const dataSendMail = mapResponseNotificationEmailBookLate(users);

    const subject = "Thông báo sách mượn đã quá hạn!";
    const emailPromises = dataSendMail.map((data) =>
        TransporterService.sendEmail(data.email, subject, notifyBookLate(data), {
            email: data?.emailSMTP,
            password: data?.passwordSMTP,
        })
    );

    await Promise.all(emailPromises);
}

module.exports = sendLateNotificationEmail;
