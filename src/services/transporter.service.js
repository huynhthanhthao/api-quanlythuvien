const nodemailer = require("nodemailer");

class TransporterService {
    static async sendEmail(recipientEmail, token) {
        try {
            const transporter = this.createTransporter();

            const mailOptions = this.createMailOptions(recipientEmail, token);

            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully!");
        } catch (error) {
            console.log("Error occurred while sending email:", error.message);
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

    static createMailOptions(recipientEmail, token) {
        return {
            from: process.env.MAIL_USERNAME,
            to: recipientEmail,
            subject: "Booking Form Submission",
            html: `<p>Please use the following token to confirm your booking: <strong>${token}</strong></p>`,
        };
    }
}

module.exports = TransporterService;
