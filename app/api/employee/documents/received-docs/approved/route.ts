import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { UserID: number };
    const approverId = decoded.UserID;
    const { requestId } = await req.json(); // ✅ Get the documentId from the body

    // ✅ Step 1: Update DocumentRequest status to Approved
    await db.documentRequest.update({
      where: { RequestID: requestId },
      data: {
        StatusID: 4, // ✅ Assuming 2 = Approved
        CompletedAt: new Date(),
      },
    });

    // ✅ Step 2: Log activity
    await db.activityLog.create({
      data: {
        PerformedBy: approverId,
        Action: "Approve Document",
        Remarks: `Approved request ID ${requestId}`,
        Timestamp: new Date(),
        TargetType: "DocumentRequest",
        TargetID: requestId,
      },
    });

    // ✅ Step 3: Check if all approvers have approved the document
    const request = await db.documentRequest.findUnique({
      where: { RequestID: requestId },
      include: { Document: true },
    });

    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const documentId = request.DocumentID;

    const approvers = await db.documentRequest.findMany({
      where: { DocumentID: documentId, IsDeleted: false },
    });

    const allApproved = approvers.every(req => req.StatusID === 4); // 4 = Approved

    if (allApproved) {
      // ✅ Step 4: Notify the requester
      await db.notification.create({
        data: {
          ReceiverID: request.RequestedByID,
          SenderID: approverId,
          Title: "All Approvers Approved",
          Message: `All approvers have approved your document titled "${request.Document.Title}". You may now mark it as completed.`,
          IsRead: false,
          CreatedAt: new Date(),
        },
      });

      await db.document.update({
        where: { DocumentID: documentId },  
        data: {
          Status: "Awaiting-Completion",
          UpdatedAt: new Date(),
        }
        });
    }

    return NextResponse.json({ success: true, allApproved });
  } catch (err) {
    console.error("Approval error:", err);
    return NextResponse.json({ error: "Failed to approve document" }, { status: 500 });
  }
}
