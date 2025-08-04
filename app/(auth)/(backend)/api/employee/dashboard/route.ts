import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const pendingSignatures = await db.documentRequest.count({
      where: {
        Status: { StatusName: "Pending" },
      },
    });

    const inProcess = await db.documentRequest.count({
      where: {
        Status: { StatusName: "In Process" },
      },
    });

    const completed = await db.documentRequest.count({
      where: {
        Status: { StatusName: "Completed" },
      },
    });

    const newRequests = await db.documentRequest.count({
      where: {
        Status: { StatusName: "New" },
      },
    });

    const recentDocuments = await db.documentRequest.findMany({
      take: 5,
      orderBy: { RequestedAt: "desc" },
      include: {
        Document: {
          include: {
            Department: true,
          },
        },
        Status: true,
        // User: true, // <- Removed because 'User' is not a valid relation
      },
    });

    return NextResponse.json({
      pendingSignatures,
      inProcess,
      completed,
      newRequests,
      recentDocuments,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
