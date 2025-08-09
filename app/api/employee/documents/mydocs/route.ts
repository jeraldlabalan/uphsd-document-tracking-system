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

    // Step 1: Fetch document requests assigned to this user (Recipient)
    const requests = await db.documentRequest.findMany({
      where: {
        RequestedByID: userID,
        IsDeleted: false,
      },
      include: {
        Document: {
          include: {
            DocumentType: true,
            Department: true,
            Creator: {
              select: {
                FirstName: true,
                LastName: true,
              },
            },
          },
        },
        Recipient: {
          select: {
            FirstName: true,
            LastName: true,
          },
        },
        Status: true,
      },
      orderBy: {
        RequestedAt: "desc",
      },
    });

    if (!requests) {
      return NextResponse.json({ error: "No documents found" }, { status: 404 });
    }

    // Step 2: Format response
    const docs = requests.map((req) => ({
      id: req.RequestID,
      name: req.Document?.Title ?? "Untitled",
      type: req.Document?.DocumentType?.TypeName ?? "Unknown",
      department: req.Document?.Department?.Name ?? "Unknown",
      status: req.Status?.StatusName ?? "Unknown",
      date: req.RequestedAt.toISOString().split("T")[0],
      creator: `${req.Document?.Creator?.FirstName || "Unknown"} ${req.Document?.Creator?.LastName || "Unknown"}`,
      preview: `/public/uploads/files/${req.Document?.Title ?? ""}`,
      recipient: `${req.Recipient?.FirstName || "Unknown"} ${req.Recipient?.LastName || "Unknown"}`,
      remarks: req.Remarks ?? "No Remarks",
    }));


    console.log("My documents:", docs);
    return NextResponse.json({docs}, { status: 200 });
  } catch (error) {
    console.error("Error loading received documents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
