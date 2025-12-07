import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log("== sendEmail called ==");
  console.log("To:", to);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
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
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};
