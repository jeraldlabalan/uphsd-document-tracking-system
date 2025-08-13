import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      UserID: number;
      Role: string;
    };

    // Only allow admins to run this
    if (decoded.Role !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Find all documents with "Active" status
    const activeDocuments = await db.document.findMany({
      where: {
        Status: "Active",
        IsDeleted: false,
      },
    });

    if (activeDocuments.length === 0) {
      return NextResponse.json({
        message: "No documents with 'Active' status found",
        updatedCount: 0,
      });
    }

    // Update all documents with "Active" status to "In-Process"
    const updateResult = await db.document.updateMany({
      where: {
        Status: "Active",
        IsDeleted: false,
      },
      data: {
        Status: "In-Process",
        UpdatedAt: new Date(),
      },
    });

    // Log the activity
    await db.activityLog.create({
      data: {
        PerformedBy: decoded.UserID,
        Action: "Bulk Status Update",
        TargetType: "Document",
        Remarks: `Updated ${updateResult.count} documents from 'Active' to 'In-Process' status`,
        TargetID: 0, // No specific target for bulk update
      },
    });

    return NextResponse.json({
      message: `Successfully updated ${updateResult.count} documents from 'Active' to 'In-Process' status`,
      updatedCount: updateResult.count,
      previousStatus: "Active",
      newStatus: "In-Process",
    });

  } catch (error) {
    console.error("Error updating document statuses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
