import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const requestId = parseInt(params.id);
    if (isNaN(requestId)) {
        return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }
  try {
    await db.documentRequest.delete({
      where: { RequestID: requestId },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}