import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {db} from "@/lib/db";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { email: string };

    const user = await db.user.findUnique({
      where: { Email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { Email: decoded.email },
      data: { Password: hashed },
    });

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
