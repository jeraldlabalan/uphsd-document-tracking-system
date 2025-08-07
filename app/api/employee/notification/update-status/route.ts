import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    console.log("Incoming PATCH request with token:", token);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    console.log("Received body:", req.body);
    console.log("Incoming PATCH payload:", { id, status });
    if (!id || !["Read", "Unread"].includes(status)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.UserID;

    const notification = await db.notification.findUnique({
      where: { NotificationID: Number(id) },
    });

    if (!notification || notification.ReceiverID !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.notification.update({
      where: { NotificationID: Number(id) },
      data: {
        IsRead: status === "Read",
        ReadAt: status === "Read" ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Status update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
