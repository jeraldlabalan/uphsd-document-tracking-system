import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { CreatedAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("❌ Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
