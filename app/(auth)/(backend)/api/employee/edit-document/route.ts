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

    const creatorID = decoded.UserID;

    const {
      Title,
      Description,
      TypeID,
      FilePath,
      DepartmentID,
      ApproverIDs, // array of UserIDs
    } = await req.json();

    // Step 1: Create the document
    const newDocument = await db.document.create({
      data: {
        Title,
        Description,
        TypeID: 1, // for testing only
        CreatedBy: creatorID,
        DepartmentID: DepartmentID || null,
      },
    });

    await db.activityLog.create({
      data: {
        PerformedBy: creatorID,
        Action: "Created Document",
        TargetType: "Document",
        Remarks: `Document "${Title}" created with ID ${newDocument.DocumentID}`,
        TargetID: newDocument.DocumentID,
      },
    });

    // Step 2: Create initial version and logs user activity
    const newVersion = await db.documentVersion.create({
      data: {
        DocumentID: newDocument.DocumentID,
        VersionNumber: 1,
        FilePath,
        ChangedBy: creatorID,
        ChangeDescription: "Initial version",
      },
    });

    await db.activityLog.create({
      data: {
        PerformedBy: creatorID,
        Action: "Created Document Version",
        TargetType: "DocumentVersion",
        Remarks: `Initial version uploaded for document ID ${newDocument.DocumentID}`,
        TargetID: newVersion.VersionID,
      },
    });

    // Step 3: Find 'In-Process' status
    const pendingStatus = await db.status.findFirst({
      where: { StatusName: "In-Process" },
    });

    if (!pendingStatus) {
      return NextResponse.json(
        { error: "Missing 'In-Process' status in DB" },
        { status: 500 }
      );
    }

    // Step 4: Create requests and notifications
    const requests = ApproverIDs.map(async (approverID: number) => {
      const request = await db.documentRequest.create({
        data: {
          RequestedByID: creatorID,
          RecipientUserID: approverID, // <- Now correct!
          DocumentID: newDocument.DocumentID,
          StatusID: pendingStatus.StatusID,
          Priority: "Normal",
          Remarks: "Awaiting review",
        },
      });

      await db.activityLog.create({
        data: {
          PerformedBy: creatorID,
          Action: "Created Document Request",
          TargetType: "DocumentRequest",
          Remarks: `Request created for user ${approverID} on document ${newDocument.DocumentID}`,
          TargetID: request.RequestID,
        },
      });

      return request;
    });

    const notifs = ApproverIDs.map(async (approverID: number) => {
      const notif = await db.notification.create({
        data: {
          SenderID: creatorID,
          ReceiverID: approverID, // <- Now correct!
          Title: "New Document for Review",
          Message: `A new document "${Title}" requires your review.`,
        },
      });

      await db.activityLog.create({
        data: {
          PerformedBy: creatorID,
          Action: "Sent Notification",
          TargetType: "Notification",
          Remarks: `Notification sent to user ${approverID} for document ${newDocument.DocumentID}`,
          TargetID: notif.NotificationID,
        },
      });

      return notif;
    });

    await Promise.all([...requests, ...notifs]);

    return NextResponse.json({
      message: "Document successfully created",
      documentID: newDocument.DocumentID,
    });
  } catch (error) {
    console.error("Document creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
