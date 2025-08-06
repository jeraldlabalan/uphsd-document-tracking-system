// /app/api/document-types/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const types = await db.documentType.findMany({
      where: { IsDeleted: false }, // Only fetch active ones
      select: {
        TypeID: true,
        TypeName: true,
      },
    });

    return NextResponse.json(types);
  } catch (error) {
    console.error("Failed to fetch document types:", error);
    return NextResponse.json({ message: "Error fetching document types" }, { status: 500 });
  }
}
