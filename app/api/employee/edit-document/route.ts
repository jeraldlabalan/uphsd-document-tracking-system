import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
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
    const depValue = formData.get("DepartmentID");
    const DepartmentID = depValue ? Number(depValue) : null;;
    const ApproverIDs = JSON.parse(
      (formData.get("ApproverIDs") as string) || "[]"
    ) as number[];
    const files = formData.getAll("files") as File[];

    // Check if placeholders data is provided
    const placeholdersData = formData.get("Placeholders") as string;
    const placeholders = placeholdersData ? JSON.parse(placeholdersData) : null;
    
    console.log("PUT request received:", {
      DocumentID,
      Title,
      ApproverIDs,
      placeholdersCount: placeholders ? placeholders.length : 0,
      placeholders
    });

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

    // 1) Update document metadata and reset status to "In-Process"
    await db.document.update({
      where: { DocumentID },
      data: {
        Title,
        Description,
        TypeID,
        DepartmentID,
        UpdatedAt: new Date(),
        Status: "In-Process", // Reset status to In-Process when document is updated
      },
    });

    // 2) Handle file uploads (only if files are provided)
    let createdVersionId: number | null = null;
    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
      
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        const FilePath = `/uploads/documents/${filename}`;

        const newVersion = await db.documentVersion.create({
          data: {
            DocumentID,
            VersionNumber: (existing.Versions[0]?.VersionNumber || 0) + 1,
            FilePath,
            ChangedBy: editorID,
            ChangeDescription: "Document updated with new file",
          },
        });

        createdVersionId = newVersion.VersionID;

        await db.activityLog.create({
          data: {
            PerformedBy: editorID,
            Action: "Updated Document Version",
            TargetType: "DocumentVersion",
            Remarks: `New version uploaded for document ${DocumentID}`,
            TargetID: newVersion.VersionID,
          },
        });
      }
    }

    // 3) Handle approvers and notifications
    let createReqs: Promise<any>[] = [];
    let notifications: Promise<any>[] = [];

    // Get In-Process status
    const inProcess = await db.status.findFirst({ where: { StatusName: "In-Process" } });
    if (!inProcess) {
      return NextResponse.json({ error: "Missing 'In-Process' status in DB" }, { status: 500 });
    }

    if (ApproverIDs && ApproverIDs.length > 0) {
      // Specific approvers are specified
      createReqs = ApproverIDs.map(async (approverID: number) => {
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
        
        return reqRec;
      });
    } else if (DepartmentID) {
      // No approvers required, but send notifications to all department members
      const departmentMembers = await db.user.findMany({
        where: {
          DepartmentID: DepartmentID,
          UserID: { not: editorID }, // Exclude the editor
          IsActive: true,
          IsDeleted: false,
        },
        select: {
          UserID: true,
        },
      });

      // If files are uploaded, create document requests for all department members
      // If no files, just send notifications for hardcopy documents
      if (files && files.length > 0) {
        // Create document requests for all department members so they can see and act on the updated document
        createReqs = departmentMembers.map(async (member) => {
          const reqRec = await db.documentRequest.create({
            data: {
              RequestedByID: editorID,
              RecipientUserID: member.UserID,
              DocumentID,
              StatusID: inProcess.StatusID,
              Priority: "Normal",
              Remarks: "Document updated and available for review - no approval required",
            },
          });

          await db.notification.create({
            data: {
              SenderID: editorID,
              ReceiverID: member.UserID,
              Title: "Document Updated",
              Message: `A document "${Title}" has been updated in your department with uploaded files. This document is available for your review and does not require specific approval.`,
            },
          });

          await db.activityLog.create({
            data: {
              PerformedBy: editorID,
              Action: "Created Department Update Request",
              TargetType: "DocumentRequest",
              Remarks: `Document update request created for department member ${member.UserID} for document ${DocumentID}`,
              TargetID: reqRec.RequestID,
            },
          });

          return reqRec;
        });
      } else {
        // No files - hardcopy document requiring wet signatures, just send notifications
        notifications = departmentMembers.map(async (member) => {
          const notif = await db.notification.create({
            data: {
              SenderID: editorID,
              ReceiverID: member.UserID,
              Title: "Document Updated",
              Message: `A document "${Title}" has been updated in your department. This document requires wet signatures and does not need digital approval.`,
            },
          });

          await db.activityLog.create({
            data: {
              PerformedBy: editorID,
              Action: "Sent Department Update Notification",
              TargetType: "Notification",
              Remarks: `Department update notification sent to user ${member.UserID} for document ${DocumentID}`,
              TargetID: notif.NotificationID,
            },
          });
          
          return notif;
        });
      }
    }

    await Promise.all([...createReqs, ...notifications]);

    // 4) Handle signature placeholders if provided
    if (placeholders && placeholders.length > 0) {
      // Delete existing placeholders for this document
      await db.signaturePlaceholder.deleteMany({
        where: { DocumentID },
      });

      // Create new placeholders
      console.log("Creating placeholders:", placeholders);
      const placeholderPromises = placeholders.map(async (placeholder: any) => {
        console.log("Creating placeholder for user:", placeholder.assignedToId);
        const newPlaceholder = await db.signaturePlaceholder.create({
          data: {
            DocumentID,
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
            PerformedBy: editorID,
            Action: "Updated Signature Placeholder",
            TargetType: "SignaturePlaceholder",
            Remarks: `Signature placeholder updated for user ${placeholder.assignedToId} on document ${DocumentID}`,
            TargetID: newPlaceholder.PlaceholderID,
          },
        });

        return newPlaceholder;
      });

      await Promise.all(placeholderPromises);

      // Document status is already set to "In-Process" above, no need to update again
    }

    // 5) Activity logs
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

export async function PUT(req: NextRequest) {
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

    // Check if placeholders data is provided
    const placeholdersData = formData.get("Placeholders") as string;
    const placeholders = placeholdersData ? JSON.parse(placeholdersData) : null;

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

    // 2) Create new version(s) if files are provided
    let createdVersionId: number | null = null;
    if (files && files.length > 0) {
      // Find latest version number
      const latest = await db.documentVersion.findFirst({
        where: { DocumentID },
        orderBy: { VersionNumber: "desc" },
      });
      let versionNumber = (latest?.VersionNumber || 0) + 1;

      const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
      
      // Create directory if it doesn't exist
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        console.error("Error creating upload directory:", err);
        return NextResponse.json({ error: "Failed to create upload directory" }, { status: 500 });
      }

      for (const file of files) {
        try {
          // Save file to disk
          const buffer = Buffer.from(await file.arrayBuffer());
          // Extract only the file extension from the original name
          const fileExtension = file.name.split('.').pop() || 'pdf';
          const filename = `${uuidv4()}.${fileExtension}`;
          const filePath = path.join(uploadDir, filename);
          
          await writeFile(filePath, buffer);
          const FilePath = `/uploads/documents/${filename}`;

                  const newVersion = await db.documentVersion.create({
            data: {
              DocumentID,
              VersionNumber: versionNumber++,
              FilePath: FilePath,
              ChangedBy: editorID,
              ChangeDescription: "Updated version with placeholders",
            },
          });
          createdVersionId = newVersion.VersionID;
        } catch (fileError) {
          console.error("Error processing file:", file.name, fileError);
          return NextResponse.json({ 
            error: `Failed to process file ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}` 
          }, { status: 500 });
        }
      }
    }

    // 3) Reset requests/notifications to match new approvers and reset document status
    await db.documentRequest.deleteMany({ where: { DocumentID } });
    await db.notification.deleteMany({
      where: {
        Title: {
          in: ["New Document for Review", "Document Update", "Document Ready for Signature"],
        },
        ReceiverID: { in: ApproverIDs },
      },
    });

    // Reset document status to "In-Process" when updating
    await db.document.update({
      where: { DocumentID },
      data: { Status: "In-Process" },
    });

    const inProcess = await db.status.findFirst({ where: { StatusName: "In-Process" } });
    if (!inProcess) {
      return NextResponse.json({ error: "Missing 'In-Process' status in DB" }, { status: 500 });
    }

    let createReqs: Promise<any>[] = [];
    let notifications: Promise<any>[] = [];

    if (ApproverIDs.length > 0) {
      // Create requests for specific approvers
      createReqs = ApproverIDs.map(async (approverID) => {
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

        const notif = await db.notification.create({
          data: {
            SenderID: editorID,
            ReceiverID: approverID,
            Title: "Document Ready for Signature",
            Message: `A document "${Title}" is ready for your signature. Please review and sign the document.`,
          },
        });
        
        console.log(`Notification created for user ${approverID} for document ${DocumentID}`);

        await db.activityLog.create({
          data: {
            PerformedBy: editorID,
            Action: "Updated Document Request",
            TargetType: "DocumentRequest",
            Remarks: `Request created for user ${approverID} on document ${DocumentID}`,
            TargetID: reqRec.RequestID,
          },
        });
        
        return { reqRec, notif };
      });
      
} else if (DepartmentID === null) {
  // --- Case 2: ALL departments

  // Handle new version only if files are provided
  let newVersion = null;
  if (files && files.length > 0) {
    const latestVersion = await db.documentVersion.findFirst({
      where: { DocumentID },
      orderBy: { VersionNumber: "desc" },
    });
    const versionNumber = (latestVersion?.VersionNumber || 0) + 1;

    const file = files[0];
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "pdf";
    const filename = `${uuidv4()}.${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    newVersion = await db.documentVersion.create({
      data: {
        DocumentID,
        FilePath: `/uploads/documents/${filename}`,
        VersionNumber: versionNumber,
        ChangedBy: editorID,
        ChangeDescription: "Document updated and shared with all departments",
      },
    });
  }

  // Get all active users (except the editor)
  const allMembers = await db.user.findMany({
    where: {
      UserID: { not: editorID },
      IsActive: true,
      IsDeleted: false,
    },
    select: { UserID: true },
  });

  // Get existing requests for this doc
  const existingRequests = await db.documentRequest.findMany({
    where: { DocumentID },
  });
  const existingUserIDs = new Set(existingRequests.map((req) => req.RecipientUserID));

  const updatesAndCreates = allMembers.map(async (member) => {
    if (existingUserIDs.has(member.UserID)) {
      // ✅ Update existing request
      const updated = await db.documentRequest.updateMany({
        where: {
          DocumentID,
          RecipientUserID: member.UserID,
        },
        data: {
          StatusID: inProcess.StatusID,
          Priority: "Normal",
          Remarks: "Document updated and remains shared with all departments",
        },
      });

      await db.notification.create({
        data: {
          SenderID: editorID,
          ReceiverID: member.UserID,
          Title: "Document Updated",
          Message: `The document "${Title}" has been updated${newVersion ? ` to version ${newVersion.VersionNumber}` : ""}.`,
        },
      });

      await db.activityLog.create({
        data: {
          PerformedBy: editorID,
          Action: "Updated All-Departments Document Request",
          TargetType: "DocumentRequest",
          Remarks: `Request updated for user ${member.UserID} on document ${DocumentID}`,
          TargetID: DocumentID,
        },
      });

      return updated;
    } else {
      // ✅ Create new request
      const created = await db.documentRequest.create({
        data: {
          RequestedByID: editorID,
          RecipientUserID: member.UserID,
          DocumentID,
          StatusID: inProcess.StatusID,
          Priority: "Normal",
          Remarks: "Document shared with all departments",
        },
      });

      await db.notification.create({
        data: {
          SenderID: editorID,
          ReceiverID: member.UserID,
          Title: "Document Shared",
          Message: `The document "${Title}"${newVersion ? ` (v${newVersion.VersionNumber})` : ""} has been shared with all departments.`,
        },
      });

      await db.activityLog.create({
        data: {
          PerformedBy: editorID,
          Action: "Created All-Departments Document Request",
          TargetType: "DocumentRequest",
          Remarks: `Request created for user ${member.UserID} on document ${DocumentID}`,
          TargetID: created.RequestID,
        },
      });

      return created;
    }
  });

  await Promise.all(updatesAndCreates);
    } else if (DepartmentID) {
      // No approvers required, but send notifications to all department members
      const departmentMembers = await db.user.findMany({
        where: {
          DepartmentID: DepartmentID,
          UserID: { not: editorID }, // Exclude the editor
          IsActive: true,
          IsDeleted: false,
        },
        select: {
          UserID: true,
        },
      });

      // Always create document requests for all department members so they can track and act on documents
      // This applies to both files and hardcopy documents
      createReqs = departmentMembers.map(async (member) => {
        let remarks = "";
        let notificationTitle = "";
        let notificationMessage = "";
        
        if (files && files.length > 0) {
          // Files uploaded - document available for review
          remarks = "Document updated and available for review - no approval required";
          notificationTitle = "Document Updated";
          notificationMessage = `A document "${Title}" has been updated in your department with uploaded files. This document is available for your review and does not require specific approval.`;
        } else {
          // No files - hardcopy document requiring wet signatures
          remarks = "Hardcopy document updated - track status and add remarks";
          notificationTitle = "Hardcopy Document Updated";
          notificationMessage = `A hardcopy document "${Title}" has been updated in your department. This document requires wet signatures. You can track its status, put it on hold, or add remarks about any issues.`;
        }

        const reqRec = await db.documentRequest.create({
          data: {
            RequestedByID: editorID,
            RecipientUserID: member.UserID,
            DocumentID,
            StatusID: inProcess.StatusID,
            Priority: "Normal",
            Remarks: remarks,
          },
        });

        await db.notification.create({
          data: {
            SenderID: editorID,
            ReceiverID: member.UserID,
            Title: notificationTitle,
            Message: notificationMessage,
          },
        });

        await db.activityLog.create({
          data: {
            PerformedBy: editorID,
            Action: "Created Department Update Request",
            TargetType: "DocumentRequest",
            Remarks: `Document update request created for department member ${member.UserID} for document ${DocumentID}`,
            TargetID: reqRec.RequestID,
          },
        });

        return reqRec;
      });
    }

    await Promise.all([...createReqs, ...notifications]);

    // 4) Handle signature placeholders if provided
    if (placeholders && placeholders.length > 0) {
      // Delete existing placeholders for this document
      await db.signaturePlaceholder.deleteMany({
        where: { DocumentID },
      });

      // Create new placeholders
      const placeholderPromises = placeholders.map(async (placeholder: any) => {
        const newPlaceholder = await db.signaturePlaceholder.create({
          data: {
            DocumentID,
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
            PerformedBy: editorID,
            Action: "Updated Signature Placeholder",
            TargetType: "SignaturePlaceholder",
            Remarks: `Signature placeholder updated for user ${placeholder.assignedToId} on document ${DocumentID}`,
            TargetID: newPlaceholder.PlaceholderID,
          },
        });

        return newPlaceholder;
      });

      await Promise.all(placeholderPromises);

      // Document status is already set to "In-Process" above, no need to update again
    }

    // 5) Activity logs
    await db.activityLog.create({
      data: {
        PerformedBy: editorID,
        Action: "Updated Document with Placeholders",
        TargetType: "Document",
        Remarks: `Document "${Title}" (ID ${DocumentID}) updated with signature placeholders`,
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

    return NextResponse.json({ message: "Document with placeholders successfully updated" });
  } catch (error) {
    console.error("Edit Document with Placeholders Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
