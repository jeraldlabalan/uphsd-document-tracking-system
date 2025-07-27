// app/api/user/position/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust this if your db path is different

export async function GET() {
  try {
    const positions = await db.position.findMany({
      where: { IsDeleted: false },
      select: {
        PositionID: true,
        Name: true,
      },
    });

    return NextResponse.json(positions); // ✅ Must return an array, not an object
  } catch (error) {
    console.error("❌ Failed to fetch positions:", error);
    return NextResponse.json(
      { message: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}
