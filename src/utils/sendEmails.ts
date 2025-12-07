import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log("== sendEmail called ==");
  console.log("To:", JSON.stringify(to));
  console.log("Subject:", subject);
  console.log("Email user:", process.env.EMAIL_USER);
  console.log("Email pass:", process.env.EMAIL_PASS ? "Exists" : "Missing");

  const transporter = nodemailer.createTransport({
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
  } catch (err: any) {
    console.error("Error sending email:");
    console.error("  name:", err.name);
    console.error("  code:", err.code);
    console.error("  response:", err.response);
    console.error("  command:", err.command);
    throw err;
  }
};
