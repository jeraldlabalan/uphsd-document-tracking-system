import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { UserID: number };
    const userID = decoded.UserID;

    // My Docs: only documents CREATED by this user
    const documents = await db.document.findMany({
      where: {
        CreatedBy: userID,
        IsDeleted: false,
      },
      include: {
        DocumentType: true,
        Department: true,
        Creator: {
          select: {
            FirstName: true,
            LastName: true,
          },
        },
        Versions: {
          where: { IsDeleted: false },
          orderBy: { CreatedAt: "desc" },
          take: 1, // latest version only
          select: { FilePath: true },
        },
        Requests: {
          where: { IsDeleted: false },
          include: {
            Recipient: { select: { FirstName: true, LastName: true } },
            Status: true,
          },
          orderBy: { RequestedAt: "desc" },
        },
      },
      orderBy: { CreatedAt: "desc" },
    });

    if (!documents || documents.length === 0) {
      return NextResponse.json({ docs: [] }, { status: 200 });
    }

    // Map to unique docs (already unique per Document), derive status from latest request
    const docs = documents.map((doc: any) => {
      const latestFilepath = doc.Versions?.[0]?.FilePath ?? "";
      const primaryRequest = doc.Requests?.[0]; // latest request





      return {
        id: doc.DocumentID, // for edit
        requestId: primaryRequest?.RequestID ?? null,
        documentId: doc.DocumentID,
        name: doc.Title ?? "Untitled",
        type: doc.DocumentType?.TypeName ?? "Unknown",
        department: doc.Department?.Name ?? "Unknown",
        status: primaryRequest?.Status?.StatusName ?? "Unknown",
        date: doc.CreatedAt.toISOString().split("T")[0],
        creator: `${doc.Creator?.FirstName || "Unknown"} ${doc.Creator?.LastName || "Unknown"}`,
        file: latestFilepath ? latestFilepath.split('/').pop() || "Unknown file" : "No file",
        preview: latestFilepath ? latestFilepath : "",
        latestVersion: {
          filePath: latestFilepath || "",
        },
        recipient: primaryRequest?.Recipient
          ? `${primaryRequest.Recipient.FirstName || "Unknown"} ${primaryRequest.Recipient.LastName || "Unknown"}`
          : "N/A",
        remarks: primaryRequest?.Remarks ?? "No Remarks",
      };
    });


    
    return NextResponse.json({ docs }, { status: 200 });
  } catch (error) {
    console.error("Error loading my documents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
