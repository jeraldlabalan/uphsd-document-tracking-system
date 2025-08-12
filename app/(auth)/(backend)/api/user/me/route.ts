import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value; // 🔧 match this with your other routes
    console.log("Token from cookies:", token);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as { email: string };

    const user = await db.user.findUnique({
      where: { Email: decoded.email },
      select: {
        UserID: true,
        FirstName: true,
        LastName: true,
        ProfilePicture: true,
      },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (err.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
