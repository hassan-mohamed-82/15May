"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, text) => {
    console.log("== sendEmail called ==");
    console.log("To:", to);
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    try {
        const info = await transporter.sendMail({
            from: `"15May Club" <${process.env.EMAIL_USER}>`, // ← هنا التعديل
            to: to,
            subject: subject,
            text: text,
            html: `<div style="font-family: Arial; direction: rtl; padding: 20px;">
        <h2>كود التحقق</h2>
        <p style="font-size: 24px; font-weight: bold;">${text}</p>
      </div>`,
        });
        console.log("Email sent - accepted:", info.accepted);
        console.log("Email sent - rejected:", info.rejected);
        console.log("Email sent - messageId:", info.messageId);
        return info;
    }
    catch (err) {
        console.error("Error:", err.message);
        throw err;
    }
};
exports.sendEmail = sendEmail;
