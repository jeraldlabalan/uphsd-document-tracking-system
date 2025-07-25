import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function POST(req: Request) {
  const { otp, token } = await req.json();
  console.log("Received OTP:", otp, "and token:", token);

  try {
    const decoded: any = jwt.verify(token, SECRET);

    if (decoded.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // success — you could also attach userId or email for the next step
    return NextResponse.json({ message: "OTP verified" });

  } catch (err) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
}