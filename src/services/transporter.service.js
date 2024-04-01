const nodemailer = require("nodemailer");

class TransporterService {
    static async sendEmail(recipientEmail, subject, htmlContent, accountEmail) {
        try {
            const transporter = this.createTransporter(accountEmail);
            const mailOptions = this.createMailOptions(recipientEmail, subject, htmlContent);
            await transporter.sendMail(mailOptions);

            console.log("Gửi email thành công!");
        } catch (error) {
            console.error("Lỗi khi gửi email:", error.message);
        }
    }

    static createTransporter(accountEmail) {
        return nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: accountEmail?.email,
                pass: accountEmail?.password,
            },
        });
    }

    static createMailOptions(recipientEmail, emailSubject, emailHtml) {
        return {
            from: process.env.MAIL_USERNAME,
            to: recipientEmail,
            subject: emailSubject,
            html: emailHtml,
        };
    }
}

module.exports = TransporterService;
