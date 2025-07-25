import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/history
export async function GET() {
  try {
    const requests = await db.documentRequest.findMany({
      include: {
        Document: true,
        User: true,
        Status: true,
      },
      orderBy: {
        RequestedAt: "desc",
      },
    });

    const history = requests.map((req) => ({
      id: req.RequestID,
      title: req.Document.Title,
      approve: req.User.FullName,
      status: req.Status.StatusName,
      created: req.RequestedAt.toISOString(),
      completed: req.CompletedAt ? req.CompletedAt.toISOString() : null,
    }));

    return NextResponse.json(history);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}
