// app/api/documents/route.ts

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

    const requests = await db.documentRequest.findMany({
      where: { RequestedByID: userID, IsDeleted: false },
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
        Status: true,
      },
      orderBy: {
        RequestedAt: "desc",
      },
    });
    if (!requests) {
      return NextResponse.json({ error: "No documents found" }, { status: 404 });
    }

 const docs = requests.map((req) => ({
  id: req.RequestID,
  name: req.Document?.Title ?? "Unknown", // ✅ renamed to `name`
  type: req.Document?.DocumentType?.TypeName ?? "Unknown", // ✅ renamed to `type`
  status: req.Status?.StatusName ?? "Unknown",
  date: req.RequestedAt.toISOString().split("T")[0],
  creator: `${req.Document?.Creator?.FirstName || "Unknown"} ${req.Document?.Creator?.LastName || "Unknown"}`,
  preview: `/uploads/${req.Document?.Title ?? ""}`, // ✅ optional
}));

    const total = docs.length;
    const inProcess = docs.filter((doc) => doc.status === "In Process").length;
    const completed = docs.filter((doc) => doc.status === "Completed").length;

    return NextResponse.json({
      docs,
      summary: {
        total,
        inProcess,
        completed,
      },
    });
  } catch (err) {
    console.error("Error fetching documents:", err);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}
