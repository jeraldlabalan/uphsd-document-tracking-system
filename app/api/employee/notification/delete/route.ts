import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.UserID;

    const notification = await db.notification.findUnique({
      where: { NotificationID: Number(id) },
    });

    if (!notification || notification.ReceiverID !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await db.notification.update({
      where: { NotificationID: Number(id) },
      data: { IsDeleted: true },
    });

    // Log the deletion
    await db.activityLog.create({
      data: {
        PerformedBy: userId,
        Action: "Deleted Notification",
        TargetType: "Notification",
        Remarks: `Notification "${notification.Title}" deleted with ID ${id}`,
        TargetID: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
