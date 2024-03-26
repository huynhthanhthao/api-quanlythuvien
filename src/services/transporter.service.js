const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const db = require("../models");

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
                user: "your_email@gmail.com",
                pass: "your_password",
            },
        });
    }

    static createMailOptions(recipientEmail, token) {
        return {
            from: "your_email@gmail.com",
            to: recipientEmail,
            subject: "Booking Form Submission",
            html: `<p>Please use the following token to confirm your booking: <strong>${token}</strong></p>`, // Nội dung email dưới dạng HTML
        };
    }
}

module.exports = TransporterService;
