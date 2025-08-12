import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { UserID: number };
    const userID = decoded.UserID;

    const { id } = await params;
    const documentId = Number(id);
    if (!documentId || Number.isNaN(documentId)) {
      return NextResponse.json({ error: "Invalid document id" }, { status: 400 });
    }

    const document = await db.document.findFirst({
      where: {
        DocumentID: documentId,
        IsDeleted: false,
      },
      include: {
        DocumentType: true,
        Department: true,
        Creator: {
          select: { FirstName: true, LastName: true, UserID: true },
        },
        Versions: {
          where: { IsDeleted: false },
          orderBy: { VersionNumber: "desc" },
          take: 1,
        },
        Requests: {
          where: { IsDeleted: false },
          include: {
            Recipient: {
              select: { UserID: true, FirstName: true, LastName: true },
            },
            Status: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const hasPermission =
      document.CreatedBy === userID ||
      document.Requests.some((req) => req.RecipientUserID === userID || req.RequestedByID === userID);

    if (!hasPermission) {
      console.warn("Document access denied", {
        userID,
        documentId,
        createdBy: document.CreatedBy,
        requestRecipients: document.Requests.map(r => r.RecipientUserID),
        requestCreators: document.Requests.map(r => r.RequestedByID),
      });
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const responseBody = {
      id: document.DocumentID,
      title: document.Title,
      description: document.Description,
      typeID: document.TypeID,
      typeName: document.DocumentType?.TypeName ?? null,
      departmentID: document.DepartmentID,
      departmentName: document.Department?.Name ?? null,
      creator: `${document.Creator?.FirstName ?? ""} ${
        document.Creator?.LastName ?? ""
      }`.trim(),
      createdAt: document.CreatedAt,
      currentVersion: document.Versions[0]
        ? {
            versionID: document.Versions[0].VersionID,
            versionNumber: document.Versions[0].VersionNumber,
            filePath: document.Versions[0].FilePath,
          }
        : null,
      approvers:
        document.Requests?.map((r) => ({
          userID: r.Recipient?.UserID ?? 0,
          firstName: r.Recipient?.FirstName ?? "",
          lastName: r.Recipient?.LastName ?? "",
          status: r.Status?.StatusName ?? "",
        })) ?? [],
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (err) {
    console.error("Error fetching document by id:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
