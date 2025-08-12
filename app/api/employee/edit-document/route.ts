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
    const editorID = decoded.UserID;

    const formData = await req.formData();
    const DocumentID = Number(formData.get("DocumentID"));
    const Title = (formData.get("Title") as string) ?? "";
    const Description = (formData.get("Description") as string) ?? "";
    const TypeID = Number(formData.get("TypeID"));
    const DepartmentID = formData.get("DepartmentID")
      ? Number(formData.get("DepartmentID"))
      : null;
    const ApproverIDs = JSON.parse(
      (formData.get("ApproverIDs") as string) || "[]"
    ) as number[];
    const files = formData.getAll("files") as File[];

    if (!DocumentID) {
      return NextResponse.json({ error: "DocumentID is required" }, { status: 400 });
    }

    // Check permissions and load existing document with relations
    const existing = await db.document.findFirst({
      where: { DocumentID, IsDeleted: false },
      include: {
        Versions: { where: { IsDeleted: false }, orderBy: { VersionNumber: "desc" }, take: 1 },
        Requests: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Document not found or access denied" }, { status: 404 });
    }

    const hasPermission =
      existing.CreatedBy === editorID ||
      existing.Requests.some((r) => r.RecipientUserID === editorID);
    if (!hasPermission) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 1) Update document metadata
    await db.document.update({
      where: { DocumentID },
      data: { Title, Description, TypeID, DepartmentID },
    });

    // 2) Create new version(s) if files are provided (persist files similar to create-document)
    let createdVersionId: number | null = null;
    if (files && files.length > 0) {
      // Find latest version number
      const latest = await db.documentVersion.findFirst({
        where: { DocumentID },
        orderBy: { VersionNumber: "desc" },
      });
      let versionNumber = (latest?.VersionNumber || 0) + 1;

      const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");

      for (const file of files) {
        // Save file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        const FilePath = `/uploads/documents/${filename}`;

        const newVersion = await db.documentVersion.create({
          data: {
            DocumentID,
            VersionNumber: versionNumber++,
            FilePath: FilePath,
            ChangedBy: editorID,
            ChangeDescription: "Updated version",
          },
        });
        createdVersionId = newVersion.VersionID;
      }
    }

    // 3) Reset requests/notifications to match new approvers
    await db.documentRequest.deleteMany({ where: { DocumentID } });
    await db.notification.deleteMany({
      where: {
        Title: {
          in: ["New Document for Review", "Document Update"],
        },
      },
    });

    const inProcess = await db.status.findFirst({ where: { StatusName: "In-Process" } });
    if (!inProcess) {
      return NextResponse.json({ error: "Missing 'In-Process' status in DB" }, { status: 500 });
    }

    const createReqs = ApproverIDs.map(async (approverID) => {
      const reqRec = await db.documentRequest.create({
        data: {
          RequestedByID: editorID,
          RecipientUserID: approverID,
          DocumentID,
          StatusID: inProcess.StatusID,
          Priority: "Normal",
          Remarks: "Awaiting review",
        },
      });

      await db.notification.create({
        data: {
          SenderID: editorID,
          ReceiverID: approverID,
          Title: "Document Update",
          Message: `A document "${Title}" has been updated and needs your review.`,
        },
      });

      await db.activityLog.create({
        data: {
          PerformedBy: editorID,
          Action: "Updated Document Request",
          TargetType: "DocumentRequest",
          Remarks: `Request created for user ${approverID} on document ${DocumentID}`,
          TargetID: reqRec.RequestID,
        },
      });
    });

    await Promise.all(createReqs);

    // 4) Activity logs
    await db.activityLog.create({
      data: {
        PerformedBy: editorID,
        Action: "Updated Document",
        TargetType: "Document",
        Remarks: `Document "${Title}" (ID ${DocumentID}) updated`,
        TargetID: DocumentID,
      },
    });
    if (createdVersionId) {
      await db.activityLog.create({
        data: {
          PerformedBy: editorID,
          Action: "Created Document Version",
          TargetType: "DocumentVersion",
          Remarks: `New version added to document ID ${DocumentID}`,
          TargetID: createdVersionId,
        },
      });
    }

    return NextResponse.json({ message: "Document successfully updated" });
  } catch (error) {
    console.error("Edit Document Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
