import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      UserID: number;
    };
    const performedBy = decoded.UserID; // ✅ The user making the change
    const { requestId } = await req.json(); // ✅ The ID of the existing document request

    // 1️⃣ Find the existing request first
    const existingRequest = await db.documentRequest.findUnique({
      where: { RequestID: requestId },
      include: {
        Document: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Document request not found" },
        { status: 404 }
      );
    }

    const requestorId = existingRequest.RequestedByID;

    // 2️⃣ Update status to Completed
    await db.documentRequest.update({
      where: { RequestID: requestId },
      data: {
        StatusID: 2, // Completed
        CompletedAt: new Date(),
      },
    });

    await db.document.update({
      where: { DocumentID: existingRequest.DocumentID },
      data: {
        Status: "Completed",
      },
    });

    // 3️⃣ Log activity
    await db.activityLog.create({
      data: {
        PerformedBy: performedBy,
        Action: "Complete Document Request",
        Remarks: `Document request ID ${requestId} marked as Completed`,
        Timestamp: new Date(),
        TargetType: "DocumentRequest",
        TargetID: requestId,
      },
    });

    // 4️⃣ Get all recipients for this document
    const recipients = await db.documentRequest.findMany({
      where: { DocumentID: existingRequest.DocumentID, IsDeleted: false },
      select: { RecipientUserID: true },
    });

    const recipientIds = recipients.map((r) => r.RecipientUserID);
    const allToNotify = Array.from(new Set([...recipientIds, requestorId])); // remove duplicates

    // 5️⃣ Send notifications
    const notificationsData = allToNotify.map((userId) => ({
      ReceiverID: userId,
      SenderID: performedBy,
      Title: "Document Request Completed",
      Message: `The document request "${existingRequest.Document.Title}" has been marked as Completed.`,
      IsRead: false,
      CreatedAt: new Date(),
    }));

    await db.notification.createMany({
      data: notificationsData,
    });

    return NextResponse.json({
      success: true,
      message: "Document request completed and notifications sent",
    });
  } catch (err) {
    console.error("Complete request error:", err);
    return NextResponse.json(
      { error: "Failed to complete document request" },
      { status: 500 }
    );
  }
}
