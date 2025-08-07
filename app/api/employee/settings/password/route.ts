import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let decoded: any;
  try {
    decoded = verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "Missing passwords" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { UserID: decoded.UserID },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const isMatch = await compare(currentPassword, user.Password);
  if (!isMatch) {
    return NextResponse.json({ message: "Current password incorrect" }, { status: 400 });
  }

  const hashedNew = await hash(newPassword, 10);

  await db.user.update({
    where: { UserID: decoded.UserID },
    data: { Password: hashedNew },
  });

  return NextResponse.json({ message: "Password updated" });
}
