// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import { sign } from "jsonwebtoken";
// import { sendVerificationEmail } from "@/lib/email";

// const JWT_SECRET = process.env.JWT_SECRET!;

// export async function POST(req: Request) {
//   const body = await req.json();

//   const {
//     Firstname,
//     Lastname,
//     Email,
//     Password,
//     Sex,
//     Department,
//     Position,
//     EmployeeID,
//     MobileNumber,
//   } = body;

//   if (
//     !Firstname || !Lastname || !Email || !Password || !Sex ||
//     !Department || !Position || !EmployeeID || !MobileNumber
//   ) {
//     return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
//   }

//   if (!Email.endsWith("@cvsu.edu.ph")) {
//     return NextResponse.json({ message: "Invalid email domain." }, { status: 400 });
//   }

//   // ✅ Generate OTP
//   const otp = crypto.randomInt(100000, 999999).toString();

//   // ✅ Sign JWT with OTP + user data
//   const payload = {
//     Firstname,
//     Lastname,
//     Email,
//     Password,
//     Sex,
//     DepartmentID: parseInt(FormData.Department),
//     PositionID: parseInt(FormData.Position),
//     EmployeeID,
//     MobileNumber,
//     otp,
//   };

//   const token = sign(payload, JWT_SECRET, { expiresIn: "15m" });

//   // ✅ Send OTP email
//   console.log(`📧 Sending OTP ${otp} to ${Email}`);
//   console.log("✅ Reached SMTP call");
//   console.log(`Sending email with OTP: ${otp} to: ${Email}`);
//   await sendVerificationEmail({ to: Email, otp });
//   console.log(`✅ OTP email function called`);
//   console.log("JWT_SECRET:", JWT_SECRET);
//   console.log("✅ Signing JWT payload:", payload);
//   console.log("✅ Generated token:", token);
  

//   // ✅ Return JWT to client
//   return NextResponse.json({ message: "OTP sent!", token }, { status: 200 });
// }