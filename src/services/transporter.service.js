const nodemailer = require("nodemailer");

class TransporterService {
    static async sendEmail(data, recipientEmail, token, subject, htmlContent) {
        try {
            const transporter = this.createTransporter();
            console.log(recipientEmail, token, subject, htmlContent);
            const mailOptions = this.createMailOptions(recipientEmail, token, subject, htmlContent);

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

    static createMailOptions(recipientEmail, token, emailSubject, emailHtml) {
        return {
            from: process.env.MAIL_USERNAME,
            to: recipientEmail,
            subject: emailSubject,
            html: emailHtml,
        };
    }
}

module.exports = TransporterService;
