// /app/api/employee/notification/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Update path as needed

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const notification = await db.notification.findUnique({
    where: { NotificationID: id },
  });

  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json(notification);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  await db.notification.update({
    where: { NotificationID: id },
    data: { IsRead: true },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  // 🧼 Option 1: Soft delete
  await db.notification.update({
    where: { NotificationID: id },
    data: { IsDeleted: true },
  });

  // 🧹 Option 2: Hard delete (uncomment this if you prefer real deletion)
  // await db.notification.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
