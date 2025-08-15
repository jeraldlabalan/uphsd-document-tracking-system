import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

type JwtPayload = {
  UserID: number;
  iat: number;
  exp: number;
};

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    console.log("Token Retrieved:" + token);

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = verify(token, JWT_SECRET) as JwtPayload;
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const summary = searchParams.get("summary");

    // If summary is requested, return summary statistics
    if (summary === "true") {
      // Total documents deleted
      const totalDeleted = await db.document.count({
        where: {
          IsDeleted: true,
        },
      });

      // Total documents restored (documents that were deleted but are now active)
      const totalRestored = await db.document.count({
        where: {
          IsDeleted: false,
        },
      });

      return NextResponse.json({
        totalDeleted,
        totalRestored,
      });
    }

    // Get all deleted documents without complex filtering for now
    const deletedDocuments = await db.document.findMany({
      where: {
        IsDeleted: true,
      },
      include: {
        Creator: {
          select: {
            FirstName: true,
            LastName: true,
            Department: { select: { Name: true } },
          },
        },
        DocumentType: {
          select: {
            TypeName: true,
          },
        },
      },
      orderBy: {
        UpdatedAt: "desc",
      },
    });

    console.log("Deleted Documents: ", deletedDocuments);
    return NextResponse.json(deletedDocuments);
  } catch (error) {
    console.error("Error fetching deleted documents:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = verify(token, JWT_SECRET) as JwtPayload;
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { documentId, action } = await req.json();

    if (action === "restore") {
      // Restore the document
      const restoredDocument = await db.document.update({
        where: { DocumentID: parseInt(documentId) },
        data: {
          IsDeleted: false,
          UpdatedAt: new Date(),
        },
      });

      // Log the restoration activity
      await db.activityLog.create({
        data: {
          PerformedBy: decoded.UserID,
          Action: "Document Restored",
          TargetType: "Document",
          TargetID: parseInt(documentId),
          Timestamp: new Date(),
          IsDeleted: false,
        },
      });

      return NextResponse.json({
        message: "Document restored successfully",
        document: restoredDocument,
      });
    }

    if (action === "permanent-delete") {
      // Permanently delete the document and all related data
      // First, get the document to check if it has files
      const document = await db.document.findUnique({
        where: { DocumentID: parseInt(documentId) },
        include: {
          Versions: true,
          Requests: true,
        },
      });

      if (document) {
        // Delete related records first
        if (document.Versions.length > 0) {
          await db.documentVersion.deleteMany({
            where: { DocumentID: parseInt(documentId) },
          });
        }

        if (document.Requests.length > 0) {
          await db.documentRequest.deleteMany({
            where: { DocumentID: parseInt(documentId) },
          });
        }

        // Delete the document itself
        await db.document.delete({
          where: { DocumentID: parseInt(documentId) },
        });

        // Log the permanent deletion
        await db.activityLog.create({
          data: {
            PerformedBy: decoded.UserID,
            Action: "Document Permanently Deleted",
            TargetType: "Document",
            TargetID: parseInt(documentId),
            Timestamp: new Date(),
            IsDeleted: false,
          },
        });

        return NextResponse.json({
          message: "Document permanently deleted successfully",
        });
      }
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing document action:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
