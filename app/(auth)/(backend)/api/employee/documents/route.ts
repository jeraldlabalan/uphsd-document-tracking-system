import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    console.log("Token from cookies:", token);

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { UserID: number };
    const UserID = decoded.UserID;
    console.log("UserID from token:", UserID);

    const requests = await db.documentRequest.findMany({
      where: { UserID: UserID },
      include: {
        Document: true,
        Status: true,
      },
      orderBy: {
        RequestedAt: "desc",
      },
    });

    const docs = requests.map((req) => ({
      id: req.RequestID,
      title: req.Document.Title,
      fileType: req.Document.Type ?? "Unknown",
      status: req.Status.StatusName,
      date: req.RequestedAt.toISOString(),
    }));

    const total = docs.length;
    const inProcess = docs.filter(doc => doc.status === "In Process").length;
    const completed = docs.filter(doc => doc.status === "Completed").length;

    return NextResponse.json({ docs, summary: { total, inProcess, completed } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}