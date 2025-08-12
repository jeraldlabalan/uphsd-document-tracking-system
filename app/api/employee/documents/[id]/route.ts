import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const documentId = parseInt(params.id);

    if (isNaN(documentId)) {
      return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
    }

    // Get document with latest version and signature placeholders
    const document = await db.document.findUnique({
      where: { DocumentID: documentId, IsDeleted: false },
      include: {
        DocumentType: true,
        Department: true,
        Creator: {
          select: {
            UserID: true,
            FirstName: true,
            LastName: true,
            Email: true,
          },
        },
        Versions: {
          where: { IsDeleted: false },
          orderBy: { VersionNumber: "desc" },
          take: 1, // Get only the latest version
        },
        SignaturePlaceholders: {
          where: { IsDeleted: false },
          include: {
            AssignedTo: {
              select: {
                UserID: true,
                FirstName: true,
                LastName: true,
                Email: true,
              },
            },
          },
          orderBy: { CreatedAt: "asc" },
        },
        Requests: {
          where: { IsDeleted: false },
          include: {
            Recipient: {
              select: {
                UserID: true,
                FirstName: true,
                LastName: true,
                Email: true,
              },
            },
            Status: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check if user has permission to view this document
    const hasPermission =
      document.CreatedBy === decoded.UserID ||
      document.Requests.some((r) => r.RecipientUserID === decoded.UserID);

    if (!hasPermission) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Format the response
    const formattedDocument = {
      documentID: document.DocumentID,
      title: document.Title,
      description: document.Description,
      typeID: document.TypeID,
      typeName: document.DocumentType.TypeName,
      departmentID: document.DepartmentID,
      departmentName: document.Department?.Name,
      createdBy: document.CreatedBy,
      creator: document.Creator,
      status: document.Status,
      createdAt: document.CreatedAt,
      updatedAt: document.UpdatedAt,
      latestVersion: document.Versions[0] || null,
      signaturePlaceholders: document.SignaturePlaceholders.map((p) => ({
        placeholderID: p.PlaceholderID,
        page: p.Page,
        x: p.X,
        y: p.Y,
        width: p.Width,
        height: p.Height,
        assignedToID: p.AssignedToID,
        assignedTo: p.AssignedTo,
        isSigned: p.IsSigned,
        signedAt: p.SignedAt,
        signatureData: p.SignatureData,
      })),
      requests: document.Requests.map((r) => ({
        requestID: r.RequestID,
        recipient: r.Recipient,
        status: r.Status,
        requestedAt: r.RequestedAt,
        completedAt: r.CompletedAt,
        priority: r.Priority,
        remarks: r.Remarks,
      })),
    };

    return NextResponse.json(formattedDocument);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
