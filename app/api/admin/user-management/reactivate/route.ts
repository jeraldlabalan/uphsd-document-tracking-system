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
        IsDeleted: false,
        IsActive: true,
      },
    });

    return NextResponse.json({
      message: "User successfully reactivated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Reactivation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
