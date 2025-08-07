// app/api/employee/notification/route.ts

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { UserID: number };
    const userID = decoded.UserID;

    const notifications = await db.notification.findMany({
      where: {
        ReceiverID: userID,
        IsDeleted: false,
      },
      include: {
        Sender: {
          select: {
            FirstName: true,
            LastName: true,
            Department: {
              select: {
                Name: true,
              },
            }
          },
        },
      },
      orderBy: {
        CreatedAt: "desc",
      },
    });

    const formatted = notifications.map((notif) => ({
      id: notif.NotificationID,
      title: notif.Title,
      content: notif.Message,
      time: formatRelativeTime(notif.CreatedAt),
      tag: "Notification",
      status: notif.IsRead ? "Read" : "Unread",
      color: notif.IsRead ? "#B0BEC5" : "#2E7D32", // gray if read, green if unread
      name: `${notif.Sender.FirstName} ${notif.Sender.LastName}`,
      createdat: notif.CreatedAt.toISOString(),
      department: notif.Sender.Department?.Name || "Unknown Department"
    }));

    console.log("retrieved notifications:", formatted);
    return NextResponse.json(formatted);

  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // in minutes
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} minute${diff === 1 ? "" : "s"} ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`; 
}


