// /app/api/approvers/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
    try {
     const cookieStore = await cookies();
     const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      UserID: number;
      Role: string;
    };

    const users = await db.user.findMany({
      where: {
        UserID: { not: decoded.UserID }, // Exclude the current user\
        IsActive: true,
        IsDeleted: false,
        Role: { RoleID: 2 }, // Adjust as needed
      },
      select: {
        UserID: true,
        FirstName: true,
        LastName: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch approvers:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
