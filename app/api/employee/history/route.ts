// route.ts (GET request handler)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.UserID;

    const history = await db.documentVersion.findMany({
      where: {
        Document: {
          CreatedBy: userId,
        },
      },
      select: {
        VersionID: true,
        CreatedAt: true,
        VersionNumber: true,
        ChangedByUser: {
          // ✅ Now at correct level
          select: {
            FirstName: true,
            LastName: true,
          },
        },
        Document: {
          select: {
            Title: true,
            CreatedAt: true,
            Department: {
              select: { Name: true },
            },
            // ❌ remove CreatedByUser here
          },
        },
      },
      orderBy: {
        CreatedAt: "desc",
      },
    });
    console.log("Fetched history:", history);
    return NextResponse.json(history);
  } catch (err) {
    console.error("Error fetching history:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
