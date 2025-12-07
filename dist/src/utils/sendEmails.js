"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendEmail = async (to, subject, text) => {
    console.log("== sendEmail called ==");
    console.log("To:", to);
    try {
        const { data, error } = await resend.emails.send({
            from: "15May Club <onboarding@resend.dev>",
            to: to,
            subject: subject,
            text: text,
            html: `<div style="font-family: Arial; direction: rtl; padding: 20px;">
        <h2>كود التحقق</h2>
        <p style="font-size: 24px; font-weight: bold;">${text}</p>
      </div>`,
        });
        if (error) {
            console.error("Resend error:", error);
            throw new Error(error.message);
        }
        console.log("Email sent successfully:", data);
        return {
            accepted: [to],
            rejected: [],
            response: "OK",
            messageId: data?.id,
        };
    }
    catch (err) {
        console.error("Error sending email:", err.message);
        throw err;
    }
};
exports.sendEmail = sendEmail;
