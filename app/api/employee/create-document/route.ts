import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

    const formData = await req.formData();

    const files = formData.getAll("files") as File[];
    const Title = formData.get("Title") as string;
    const Description = formData.get("Description") as string;
    const TypeID = Number(formData.get("TypeID"));
    const DepartmentID = formData.get("DepartmentID")
      ? Number(formData.get("DepartmentID"))
      : null;
    const approverIDs = JSON.parse(
      formData.get("ApproverIDs") as string
    ) as number[];

    console.log("fetched files: ", files)

    if (!files.length || !Title || !Description || !TypeID || !approverIDs.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1: Create Document
    const newDocument = await db.document.create({
      data: {
        Title,
        Description,
        TypeID,
        CreatedBy: creatorID,
        DepartmentID,
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

    // Step 2: Save files and create DocumentVersion entries
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    let versionNumber = 1;

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${uuidv4()}-${file.name}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      const FilePath = `/uploads/documents/${filename}`;

      const newVersion = await db.documentVersion.create({
        data: {
          DocumentID: newDocument.DocumentID,
          VersionNumber: versionNumber++,
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
          Remarks: `Version ${newVersion.VersionNumber} uploaded for document ID ${newDocument.DocumentID}`,
          TargetID: newVersion.VersionID,
        },
      });
    }

    // Step 3: Get In-Process status
    const pendingStatus = await db.status.findFirst({
      where: { StatusName: "In-Process" },
    });

    if (!pendingStatus) {
      return NextResponse.json(
        { error: "Missing 'In-Process' status in DB" },
        { status: 500 }
      );
    }

    // Step 4: Create requests for approvers
    const requests = approverIDs.map(async (approverID: number) => {
      const request = await db.documentRequest.create({
        data: {
          RequestedByID: creatorID,
          RecipientUserID: approverID,
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
    });

    // Step 5: Send notifications
    const notifs = approverIDs.map(async (approverID: number) => {
      const notif = await db.notification.create({
        data: {
          SenderID: creatorID,
          ReceiverID: approverID,
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
