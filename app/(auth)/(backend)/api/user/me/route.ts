import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Use the new auth utility function
    const authResult = await verifyAuth(req);
    
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    // Get user details from database
    const userDetails = await db.user.findUnique({
      where: { UserID: user.UserID },
      select: {
        UserID: true,
        FirstName: true,
        LastName: true,
        ProfilePicture: true,
      },
    });

    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userDetails);
  } catch (err: any) {
    console.error("Error in /me route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
