import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("📦 Received payload:", body);

    const {
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      sex,
      roleID,
      departmentID,
      positionID,
      employeeID,
      profilePicture,
    } = body;

    // Validate required fields
    if (!email || !roleID || !password) {
      console.warn("❌ Missing required fields:", { email, roleID, password });
      return NextResponse.json(
        {
          message:
            "Missing required fields: email, roleID, and password are required.",
        },
        { status: 400 }
      );
    }

    // Check env vars for email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Missing email SMTP credentials in env variables.");
      return NextResponse.json(
        { message: "Email service not configured properly." },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password hashed.");

    // Insert user with "N/A" for missing string fields, null for nullable FK fields
    const newUser = await db.user.create({
      data: {
        Email: email,
        Password: hashedPassword,
        RoleID: roleID,
        FirstName: firstName || "N/A",
        LastName: lastName || "N/A",
        MobileNumber: mobileNumber || "N/A",
        Sex: sex || "N/A",
        DepartmentID: departmentID || null,
        PositionID: positionID || null,
        EmployeeID: employeeID || "N/A",
        ProfilePicture: profilePicture || "N/A",
      },
    });

    console.log("✅ User created with ID:", newUser.UserID);

    // Send email with credentials
    const info = await transporter.sendMail({
      from: `"Document Tracking System - UPHSD Las Piñas" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "New Account Credentials",
      text: `Hello!

            Your account (${email}) has been successfully created.

            Temporary password: ${password}

            Please change your password upon first login to ensure your account's security.

            Thank you!

            Best regards,
            Administrator
            Document Tracking System - UPHSD Las Piñas
`,
      html: `
        <div>
          <p>Hello!</p>
          <br>
          <p>Your account <strong>${email}</strong> has been successfully created.</p>
          <p><strong>Temporary password:</strong> ${password}</p>
          <p>Please change your password upon first login to ensure your account's security.</p>
          <p>Thank you!</p>
          <br>
          <p>Best regards,</p>
          <p>Administrator</p>
          <p>Document Tracking System - UPHSD Las Piñas</p>
        </div>
      `,
    });

    console.log("✅ Email sent. Message ID:", info.messageId);

    return NextResponse.json(
      { message: "User created and email sent", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Server error:", error);
    if (error.stack) console.error(error.stack);

    // Optional debug info (can be removed in production)
    console.log("🔎 Environment variables:");
    console.log("EMAIL_USER:", process.env.EMAIL_USER ?? "❌ Not set");
    console.log(
      "EMAIL_PASS:",
      process.env.EMAIL_PASS ? "✔️ Exists" : "❌ Missing"
    );
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL ? "✔️ Exists" : "❌ Missing"
    );

    // Handle Prisma unique constraint violation on Email
    if (
      error.code === "P2002" &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes("Email")
    ) {
      return NextResponse.json(
        { message: "Email already exists. Please use a different email." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
