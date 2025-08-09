import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: 465, // SSL port
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER?.replace(/"/g, ""), // strip quotes if in .env
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

export async function sendVerificationEmail({
  to,
  otp,
}: {
  to: string;
  otp: string;
}) {
  const mailOptions = {
    from: `"Document Tracker" <${process.env.SMTP_USER?.replace(/"/g, "")}>`,
    to,
    subject: "Your OTP Verification Code",
    html: `<p>Your OTP code is:</p><h2>${otp}</h2>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent via SMTP:", info.messageId);
  } catch (error) {
    console.error("❌ SMTP email send error:", error);
    throw error;
  }
}
