import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { UserID: number };
    const approverId = decoded.UserID;

    const { requestId, remark } = await req.json();

    // 🔍 Get the document request and its DocumentID
    const targetRequest = await db.documentRequest.findUnique({
      where: { RequestID: requestId },
      include: { Document: true },
    });

    if (!targetRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const documentId = targetRequest.DocumentID;

    // 🟠 1. Update ALL document requests related to the same document to "On Hold"
    await db.documentRequest.updateMany({
      where: { DocumentID: documentId },
      data: {
        StatusID: 3, // Assuming 3 = On Hold
        Remarks: remark,
      },
    });

    // 🟠 2. Optionally update the document status too
    await db.document.update({
      where: { DocumentID: documentId },
      data: {
        Status: "On Hold",
      },
    });

    // 🟠 3. Log to activity
    await db.activityLog.create({
      data: {
        PerformedBy: approverId,
        Action: "Put Document on Hold",
        Remarks: `Document "${targetRequest.Document.Title}" put on hold. Remark: ${remark}`,
        TargetType: "Document",
        TargetID: documentId,
        Timestamp: new Date(),
      },
    });

    // 🟠 4. Notify the document requester
    await db.notification.create({
      data: {
        ReceiverID: targetRequest.Document.CreatedBy,
        SenderID: approverId,
        Title: "Document Put on Hold",
        Message: `An approver has placed your document "${targetRequest.Document.Title}" on hold. Remark: ${remark}`,
        IsRead: false,
        CreatedAt: new Date(),
      },
    });

     // 🟠 5. Notify all other approvers (excluding the one who initiated the hold)
    const otherApprovers = await db.documentRequest.findMany({
      where: {
        DocumentID: documentId,
        RecipientUserID: { not: approverId },
      },
    });

    const notifications = otherApprovers.map((approver) => ({
      ReceiverID: approver.RecipientUserID,
      SenderID: approverId,
      Title: "Document On Hold",
      Message: `The document "${targetRequest.Document.Title}" has been put on hold by another approver. Remark: ${remark}`,
      IsRead: false,
      CreatedAt: new Date(),
    }));

    if (notifications.length > 0) {
      await db.notification.createMany({
        data: notifications,
      });
    }


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("On Hold error:", error);
    return NextResponse.json({ error: "Failed to put on hold" }, { status: 500 });
  }
}
