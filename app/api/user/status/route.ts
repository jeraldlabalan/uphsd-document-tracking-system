// app/api/user/department/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // adjust based on your prisma client path

export async function GET() {
  try {
    const departments = await db.status.findMany({
      where: { IsDeleted: false },
      select: {
        StatusID: true,
        StatusName: true,
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("❌ Failed to fetch document status:", error);
    return NextResponse.json({ message: "Failed to fetch document status." }, { status: 500 });
  }
}