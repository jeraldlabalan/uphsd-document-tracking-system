import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// GET: Retrieve documents that the current user needs to sign
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as any;
    const userId = decoded.UserID;

    // Get all signature placeholders assigned to the current user
    const pendingSignatures = await db.signaturePlaceholder.findMany({
      where: {
        AssignedToID: userId,
        IsSigned: false,
        IsDeleted: false,
      },
      include: {
        Document: {
          include: {
            Creator: {
              select: {
                FirstName: true,
                LastName: true,
                Email: true,
              },
            },
            DocumentType: {
              select: {
                TypeName: true,
              },
            },
            Department: {
              select: {
                Name: true,
              },
            },
            Versions: {
              where: { IsDeleted: false },
              orderBy: { VersionNumber: "desc" },
              take: 1, // Get only the latest version
            },
          },
        },
      },
      orderBy: {
        Document: {
          CreatedAt: 'desc',
        },
      },
    });

    // Group by document to avoid duplicates
    const documentsMap = new Map();
    console.log("Raw pendingSignatures data:", pendingSignatures);
    pendingSignatures.forEach(placeholder => {
      const docId = placeholder.DocumentID;
      if (!documentsMap.has(docId)) {
        const latestVersion = placeholder.Document.Versions[0] || null;
        console.log(`Document ${docId} latestVersion:`, latestVersion);
        
        documentsMap.set(docId, {
          documentId: docId,
          title: placeholder.Document.Title,
          type: placeholder.Document.DocumentType.TypeName,
          department: placeholder.Document.Department?.Name || 'N/A',
          creator: `${placeholder.Document.Creator.FirstName} ${placeholder.Document.Creator.LastName}`,
          creatorEmail: placeholder.Document.Creator.Email,
          createdAt: placeholder.Document.CreatedAt,
          latestVersion: latestVersion,
          placeholders: [],
        });
      }
      documentsMap.get(docId).placeholders.push({
        placeholderId: placeholder.PlaceholderID,
        page: placeholder.Page,
        x: placeholder.X,
        y: placeholder.Y,
        width: placeholder.Width,
        height: placeholder.Height,
      });
    });

    const pendingDocuments = Array.from(documentsMap.values());

    console.log("Pending signatures API - documentsMap:", documentsMap);
    console.log("Pending signatures API - pendingDocuments:", pendingDocuments);

    return NextResponse.json({ 
      pendingDocuments,
      totalCount: pendingDocuments.length 
    });
  } catch (error) {
    console.error("Error fetching pending signatures:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
