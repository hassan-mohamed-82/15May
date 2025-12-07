"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, text) => {
    console.log("== sendEmail called ==");
    console.log("To:", JSON.stringify(to));
    console.log("Subject:", subject);
    console.log("Email user:", process.env.EMAIL_USER);
    console.log("Email pass:", process.env.EMAIL_PASS ? "Exists" : "Missing");
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        logger: true, // 👈 عشان تشوف لوج ال SMTP
        debug: true,
    });
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });
        console.log("Email sent info:");
        console.log("  accepted:", info.accepted);
        console.log("  rejected:", info.rejected);
        console.log("  response:", info.response);
        return info;
    }
    catch (err) {
        console.error("Error sending email:");
        console.error("  name:", err.name);
        console.error("  code:", err.code);
        console.error("  response:", err.response);
        console.error("  command:", err.command);
        throw err;
    }
};
exports.sendEmail = sendEmail;
