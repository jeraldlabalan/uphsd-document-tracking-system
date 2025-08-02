// app/api/user/position/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // adjust if needed

export async function GET() {
  try {
    const positions = await db.position.findMany({
      where: { IsDeleted: false },
      select: {
        PositionID: true,
        Name: true,
      },
    });

    return NextResponse.json(positions); // ✅ this must be an array
  } catch (error) {
    console.error("❌ Error fetching positions:", error);
    return NextResponse.json([], { status: 500 }); // ✅ fallback to empty array
  }
}
