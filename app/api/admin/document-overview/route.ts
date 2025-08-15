import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

type JwtPayload = {
  UserID: number;
  role?: string;
  iat: number;
  exp: number;
};

function requireAdmin(token?: string | null): JwtPayload {
  if (!token) {
    throw new Error("Not authenticated");
  }
  const decoded = verify(token, JWT_SECRET) as JwtPayload;
  if (!decoded || decoded.role !== "Admin") {
    throw new Error("Not authorized");
  }
  return decoded;
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value || null;
    requireAdmin(token);

    // Summary and listing
    const [
      totalDocuments,
      inProcessDocuments,
      deletedDocuments,
      recentDocuments,
    ] = await Promise.all([
      db.document.count(),
      db.document.count({ where: { IsDeleted: false } }),
      db.document.count({ where: { IsDeleted: true } }),
      db.document.findMany({
        where: { IsDeleted: false },
        orderBy: { CreatedAt: "desc" },
        include: {
          Creator: { select: { FirstName: true, LastName: true } },
          Department: { select: { Name: true } },
          DocumentType: { select: { TypeName: true } },
        },
      }),
    ]);

    const docs = recentDocuments.map((doc) => ({
      id: doc.DocumentID,
      title: doc.Title,
      type: doc.DocumentType?.TypeName ?? "Unknown",
      department: doc.Department?.Name ?? "Unassigned",
      creator:
        `${doc.Creator?.FirstName ?? ""} ${doc.Creator?.LastName ?? ""}`.trim(),
      status: doc.Status ?? "Unknown",
      dateCreated: doc.CreatedAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({
      summary: {
        totalDocuments: activeDocuments, // Active documents with workflow statuses (same as dashboard)
        inProcessDocuments: allDocuments, // All non-deleted documents regardless of status
        deletedDocuments, // Soft-deleted documents
      },
      documents: docs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message.includes("Not authenticated")
      ? 401
      : message.includes("Not authorized")
        ? 403
        : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value || null;
    const decoded = requireAdmin(token);

    const body = await req.json();
    const documentId = Number(body?.documentId);
    if (!documentId) {
      return NextResponse.json(
        { message: "documentId is required" },
        { status: 400 }
      );
    }

    // Soft delete the document
    const updated = await db.document.update({
      where: { DocumentID: documentId },
      data: { IsDeleted: true },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        PerformedBy: decoded.UserID,
        Action: "Deleted Document",
        TargetType: "Document",
        Remarks: `Soft-deleted document ID ${documentId} (${updated.Title}) from admin overview`,
        TargetID: documentId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message.includes("Not authenticated")
      ? 401
      : message.includes("Not authorized")
        ? 403
        : 500;
    return NextResponse.json({ message }, { status });
  }
}
