import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { UserID: id },
      data: {
        IsActive: false, // Mark user as inactive
        IsDeleted: false, // Still not terminated
      },
    });

    return NextResponse.json({
      message: "User successfully deactivated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Deactivation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
