import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET all document types (not deleted)
export async function GET() {
  try {
    const types = await db.documentType.findMany({
      where: { IsDeleted: false },
      orderBy: { TypeName: "asc" },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error("GET /document-types error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new document type
export async function POST(request: NextRequest) {
  try {
    const { typeName } = await request.json();
    if (!typeName || typeof typeName !== "string" || !typeName.trim()) {
      return NextResponse.json(
        { error: "Invalid or missing typeName" },
        { status: 400 }
      );
    }

    const trimmedName = typeName.trim();

    // Check duplicate
    const existing = await db.documentType.findFirst({
      where: { TypeName: trimmedName, IsDeleted: false },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Document type already exists" },
        { status: 409 }
      );
    }

    const created = await db.documentType.create({
      data: { TypeName: trimmedName },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /document-types error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update document type name (soft update)
export async function PUT(request: NextRequest) {
  try {
    const { id, typeName } = await request.json();
    if (!id || !typeName || typeof typeName !== "string" || !typeName.trim()) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const trimmedName = typeName.trim();

    // Check exists
    const existing = await db.documentType.findUnique({
      where: { TypeID: id },
    });
    if (!existing || existing.IsDeleted) {
      return NextResponse.json(
        { error: "Document type not found" },
        { status: 404 }
      );
    }

    // Check for duplicates
    const duplicate = await db.documentType.findFirst({
      where: {
        TypeName: trimmedName,
        IsDeleted: false,
        NOT: { TypeID: id },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Another document type with this name exists" },
        { status: 409 }
      );
    }

    const updated = await db.documentType.update({
      where: { TypeID: id },
      data: { TypeName: trimmedName },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /document-types error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE (soft delete) a document type
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await db.documentType.findUnique({
      where: { TypeID: id },
    });
    if (!existing || existing.IsDeleted) {
      return NextResponse.json(
        { error: "Document type not found" },
        { status: 404 }
      );
    }

    await db.documentType.update({
      where: { TypeID: id },
      data: { IsDeleted: true },
    });

    return NextResponse.json({ message: "Document type deleted" });
  } catch (error) {
    console.error("DELETE /document-types error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
