// app/api/user/department/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // adjust based on your prisma client path

export async function GET() {
  try {
    const departments = await db.department.findMany({
      where: { IsDeleted: false },
      select: {
        DepartmentID: true,
        Name: true,
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("❌ Failed to fetch departments:", error);
    return NextResponse.json({ message: "Failed to fetch departments." }, { status: 500 });
  }
}