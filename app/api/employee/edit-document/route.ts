import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      UserID: number;
      Role: string;
    };

    const {
      DocumentID,
      Title,
      Description,
      TypeID,
      FilePath,
      DepartmentID,
      ApproverIDs,
    } = await req.json();

    // 1. Update the existing document info
    await db.document.update({
      where: { DocumentID },
      data: {
        Title,
        Description,
        TypeID,
        DepartmentID,
      },
    });

    // 2. Get the current max version number
    const latestVersion = await db.documentVersion.findFirst({
      where: { DocumentID },
      orderBy: { VersionNumber: "desc" },
    });

    const newVersionNumber = (latestVersion?.VersionNumber || 0) + 1;

    const newVersion = await db.documentVersion.create({
      data: {
        DocumentID,
        VersionNumber: newVersionNumber,
        FilePath,
        ChangedBy: decoded.UserID,
        ChangeDescription: "Updated version",
      },
    });

    // 3. Log activity
    await db.activityLog.createMany({
      data: [
        {
          PerformedBy: decoded.UserID,
          Action: "Updated Document",
          TargetType: "Document",
          Remarks: `Document "${Title}" (ID ${DocumentID}) updated.`,
          TargetID: DocumentID,
        },
        {
          PerformedBy: decoded.UserID,
          Action: "Created Document Version",
          TargetType: "DocumentVersion",
          Remarks: `New version ${newVersionNumber} added to document ID ${DocumentID}.`,
          TargetID: newVersion.VersionID,
        },
      ],
    });

    // 4. Update document requests and notifications
    const pendingStatus = await db.status.findFirst({
      where: { StatusName: "In-Process" },
    });

    if (!pendingStatus) {
      return NextResponse.json(
        { error: "Missing 'In-Process' status in DB" },
        { status: 500 }
      );
    }

    // Optional: delete existing requests and notifs, if desired
    await db.documentRequest.deleteMany({ where: { DocumentID } });
    await db.notification.deleteMany({
      where: {
        Title: "New Document for Review",
        Message: {
          contains: `"${Title}"`, // assuming consistent format
        },
      },
    });

    // 5. Re-create requests and notifications
    const requests = ApproverIDs.map(async (approverID: number) => {
      const request = await db.documentRequest.create({
        data: {
          RequestedByID: decoded.UserID,
          RecipientUserID: approverID,
          DocumentID,
          StatusID: pendingStatus.StatusID,
          Priority: "Normal",
          Remarks: "Awaiting review",
        },
      });

      await db.activityLog.create({
        data: {
          PerformedBy: decoded.UserID,
          Action: "Updated Document Request",
          TargetType: "DocumentRequest",
          Remarks: `Request created for user ${approverID} on document ${DocumentID}`,
          TargetID: request.RequestID,
        },
      });

      return request;
    });

    const notifs = ApproverIDs.map(async (approverID: number) => {
      const notif = await db.notification.create({
        data: {
          SenderID: decoded.UserID,
          ReceiverID: approverID,
          Title: "New Document for Review",
          Message: `A new version of "${Title}" requires your review.`,
        },
      });

      await db.activityLog.create({
        data: {
          PerformedBy: decoded.UserID,
          Action: "Sent Notification",
          TargetType: "Notification",
          Remarks: `Notification sent to user ${approverID} for document ${DocumentID}`,
          TargetID: notif.NotificationID,
        },
      });

      return notif;
    });

    await Promise.all([...requests, ...notifs]);

    return NextResponse.json({ message: "Document successfully updated" });
  } catch (error) {
    console.error("Edit Document Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
