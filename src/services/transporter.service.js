const nodemailer = require("nodemailer");

class TransporterService {
    static async sendEmail(recipientEmail, subject, htmlContent) {
        try {
            const transporter = this.createTransporter();
            const mailOptions = this.createMailOptions(recipientEmail, subject, htmlContent);

            await transporter.sendMail(mailOptions);
        } catch (error) {
            throw error;
        }
    }

    static createTransporter() {
        return nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
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
