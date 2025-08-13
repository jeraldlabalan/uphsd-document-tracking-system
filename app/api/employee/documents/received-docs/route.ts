import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    const userId = decoded.UserID;

    // Get documents where the user is a recipient
    const receivedDocuments = await db.documentRequest.findMany({
      where: {
        RecipientUserID: userId,
        IsDeleted: false,
      },
      include: {
        Document: {
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
                  },
                },
              },
              orderBy: { CreatedAt: "asc" },
            },
          },
        },
        Status: true,
      },
      orderBy: {
        RequestedAt: "desc",
      },
    });

    // Format the response
    const formattedDocuments = receivedDocuments.map((request) => {
      const latestVersion = request.Document.Versions[0];
      
      const formattedDoc = {
        requestID: request.RequestID,
        documentID: request.Document.DocumentID,
        title: request.Document.Title,
        description: request.Document.Description,
        type: request.Document.DocumentType.TypeName,
        department: request.Document.Department?.Name,
        creator: request.Document.Creator,
        status: request.Status.StatusName,
        documentStatus: request.Document.Status,
        requestedAt: request.RequestedAt,
        completedAt: request.CompletedAt,
        priority: request.Priority,
        remarks: request.Remarks,
        latestVersion: latestVersion ? {
          versionID: latestVersion.VersionID,
          versionNumber: latestVersion.VersionNumber,
          filePath: latestVersion.FilePath || null,
        } : null,
        signaturePlaceholders: request.Document.SignaturePlaceholders.map((p) => ({
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
      };
      
      return formattedDoc;
    });

    return NextResponse.json({
      receivedDocuments: formattedDocuments,
      totalCount: formattedDocuments.length,
    });
  } catch (error) {
    console.error("Error fetching received documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
