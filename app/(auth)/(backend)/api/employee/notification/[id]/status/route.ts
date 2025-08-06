// /app/api/employee/notification/[id]/status/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const { status } = await req.json();

  try {
    const notification = await db.notification.update({
      where: { NotificationID: id },
      data: { IsRead: status === "Read" },
    });
    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
