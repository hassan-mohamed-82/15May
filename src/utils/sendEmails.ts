import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log("== sendEmail called ==");
  console.log("To:", to);

  const transporter = nodemailer.createTransport({
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
  } catch (err: any) {
    console.error("Error:", err.message);
    throw err;
  }
};
