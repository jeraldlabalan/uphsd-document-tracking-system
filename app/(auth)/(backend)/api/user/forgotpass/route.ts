import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await db.user.findUnique({
    where: { Email: email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const token = jwt.sign(
    { email, otp, purpose: "forgotpass" },
    process.env.JWT_SECRET!,
    { expiresIn: "5m" }
  );

  // Send OTP to email
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
  });
  console.log(`OTP sent to ${email}, OTP: ${otp}`);
  return NextResponse.json({ token });
}