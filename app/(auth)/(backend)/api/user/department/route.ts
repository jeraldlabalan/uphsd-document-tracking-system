// app/api/user/department/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust this if your db path is different

export async function GET() {
  try {
    const departments = await db.department.findMany({
      where: { IsDeleted: false },
      select: {
        DepartmentID: true,
        Name: true,
      },
    });

    return NextResponse.json(departments); // ✅ Must return an array, not an object
  } catch (error) {
    console.error("❌ Failed to fetch departments:", error);
    return NextResponse.json(
      { message: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
