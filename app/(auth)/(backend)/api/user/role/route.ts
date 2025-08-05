import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust if your db path differs

export async function GET() {
  try {
    const roles = await db.role.findMany({
      where: { IsDeleted: false },
      select: {
        RoleID: true,
        RoleName: true,
      },
    });

    return NextResponse.json(roles); // returns an array of roles
  } catch (error) {
    console.error("❌ Failed to fetch roles:", error);
    return NextResponse.json(
      { message: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
