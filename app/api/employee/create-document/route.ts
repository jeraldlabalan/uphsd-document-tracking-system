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

    // Check if placeholders data is provided
    const placeholdersData = formData.get("Placeholders") as string;
    const placeholders = placeholdersData ? JSON.parse(placeholdersData) : null;

    console.log("fetched files: ", files)
    console.log("placeholders: ", placeholders)

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
        Status: "In-Process", // Explicitly set status to In-Process
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

    // Step 4: Create requests for approvers and send notifications
    let requests: Promise<any>[] = [];
    let notifs: Promise<any>[] = [];

    if (approverIDs.length > 0) {
      // Create requests for specific approvers
      requests = approverIDs.map(async (approverID: number) => {
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

      // Send notifications to specific approvers
      notifs = approverIDs.map(async (approverID: number) => {
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
    } else if (DepartmentID) {
      // No approvers required, but send notifications to all department members
      const departmentMembers = await db.user.findMany({
        where: {
          DepartmentID: DepartmentID,
          UserID: { not: creatorID }, // Exclude the creator
          IsActive: true,
          IsDeleted: false,
        },
        select: {
          UserID: true,
        },
      });

      // Send notifications to all department members
      notifs = departmentMembers.map(async (member) => {
        const notif = await db.notification.create({
          data: {
            SenderID: creatorID,
            ReceiverID: member.UserID,
            Title: "New Document Created",
            Message: `A new document "${Title}" has been created in your department.`,
          },
        });

        await db.activityLog.create({
          data: {
            PerformedBy: creatorID,
            Action: "Sent Department Notification",
            TargetType: "Notification",
            Remarks: `Department notification sent to user ${member.UserID} for document ${newDocument.DocumentID}`,
            TargetID: notif.NotificationID,
          },
        });
      });
    }

    await Promise.all([...requests, ...notifs]);

    // Step 6: Create signature placeholders if provided
    if (placeholders && placeholders.length > 0) {
      const placeholderPromises = placeholders.map(async (placeholder: any) => {
        const newPlaceholder = await db.signaturePlaceholder.create({
          data: {
            DocumentID: newDocument.DocumentID,
            Page: placeholder.page,
            X: placeholder.x,
            Y: placeholder.y,
            Width: placeholder.width,
            Height: placeholder.height,
            AssignedToID: placeholder.assignedToId,
            IsSigned: false,
          },
        });

        await db.activityLog.create({
          data: {
            PerformedBy: creatorID,
            Action: "Created Signature Placeholder",
            TargetType: "SignaturePlaceholder",
            Remarks: `Signature placeholder created for user ${placeholder.assignedToId} on document ${newDocument.DocumentID}`,
            TargetID: newPlaceholder.PlaceholderID,
          },
        });

        return newPlaceholder;
      });

      await Promise.all(placeholderPromises);

      // Update document status to "Awaiting Signatures"
      await db.document.update({
        where: { DocumentID: newDocument.DocumentID },
        data: { Status: "Awaiting Signatures" },
      });
    }

    return NextResponse.json({
      message: "Document successfully created",
      documentID: newDocument.DocumentID,
    });
  } catch (error) {
    console.error("Document creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
