// /app/api/employee/edit-document/[id]/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentID = parseInt(params.id);

    const document = await db.document.findUnique({
      where: { DocumentID: documentID },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
