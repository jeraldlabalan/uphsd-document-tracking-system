import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const userID = decoded.UserID;

    // ✅ Count by StatusName (via relation)
    const pendingSignatures = await db.documentRequest.count({ //on hold
      where: {
        RequestedByID: userID,
        Status: {
          StatusID: 3,
        },
      },
    });

    const inProcess = await db.documentRequest.count({
      where: {
        RequestedByID: userID,
        Status: {
          StatusID: 1, // In process
        },
      },
    });

    const completed = await db.documentRequest.count({
      where: {
        RequestedByID: userID,
        Status: {
          StatusID: 3,
        },
      },
    });

    // ✅ Recent 5 documents requested by user
    const recentDocuments = await db.documentRequest.findMany({
      where: {
        RequestedByID: userID,
      },
      take: 5,
      orderBy: { RequestedAt: "desc" },
      include: {
        Document: {
          include: {
            Department: true,
            DocumentType: true, // Optional: only if you want to show type
          },
        },
        Status: true,
        RequestedBy: true, // For displaying creator's name
      },
    });

    return NextResponse.json({
      pendingSignatures,
      inProcess,
      completed,
      recentDocuments,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
