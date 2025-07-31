// /app/api/documents/route.ts (or wherever appropriate)

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    // Step 1: Extract session token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    console.log("Token from cookies:", token);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Decode token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { UserID: number };
    const UserID = decoded.UserID;
    console.log("UserID from token:", UserID);

    // Step 3: Fetch document requests for the user
    const requests = await db.documentRequest.findMany({
      where: { RequestedByID: decoded.UserID },
      include: {
        Document: true, // Ensure your Prisma schema has a relation named 'Document'
        Status: true,
      },
      orderBy: {
        RequestedAt: "desc",
      },
    });

    // Step 4: Format response data
    const docs = requests.map((req: any) => ({
      id: req.RequestID,
      title: req.Document?.Title ?? "Unknown",
      fileType: req.Document?.Type ?? "Unknown",
      status: req.Status?.StatusName ?? "Unknown",
      date: req.RequestedAt.toISOString(),
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
    console.error("Error loading documents:", err);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}
