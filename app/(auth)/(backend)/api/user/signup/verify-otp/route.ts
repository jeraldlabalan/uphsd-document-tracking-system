import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const body = await req.json();
  const { token, enteredOtp } = body;
  console.log("🔍 Incoming token:", token);
  console.log("🔍 Incoming OTP:", enteredOtp);

  if (!token || !enteredOtp) {
    return NextResponse.json({ message: "Missing token or OTP." }, { status: 400 });
  }

  try {
    // JWT OTP
    const decoded: any = verify(token, JWT_SECRET);
    console.log("JWT_SECRET:", JWT_SECRET);

    if (decoded.otp !== enteredOtp) {
      return NextResponse.json({ message: "Invalid OTP." }, { status: 400 });
    }

    // ✅ Hash password
    const hashedPassword = await hash(decoded.Password, 10);

    const adminTitles = ["President", "Vice President", "Director", "Assistant Director", "Dean"];
    const role = adminTitles.includes(decoded.Position) ? "Admin" : "Employee";
  

    // ✅ Create user
    const user = await db.user.create({
      data: {
        FirstName: decoded.FirstName,
        LastName: decoded.LastName,
        Email: decoded.Email,
        Password: hashedPassword,
        Sex: decoded.Sex,
        DepartmentID: parseInt(decoded.Department),
        Position: decoded.Position,
        EmployeeID: decoded.EmployeeID,
        MobileNumber: decoded.MobileNumber,
        RoleID: 2,
      },
    });

    return NextResponse.json({ message: "Account verified & created!", userId: user.UserID }, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
  }
}
