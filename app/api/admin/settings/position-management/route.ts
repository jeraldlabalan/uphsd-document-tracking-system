import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ GET: Fetch all active positions
export async function GET() {
  try {
    const positions = await db.position.findMany({
      where: { IsDeleted: false },
      select: { PositionID: true, Name: true },
      orderBy: { Name: "asc" },
    });

    return NextResponse.json(positions);
  } catch (error) {
    console.error("GET /positions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ POST: Add single or multiple new positions with validation + detailed feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept { name: "Manager" } or { names: ["Manager", "Clerk"] }
    const rawNames: string[] = Array.isArray(body.names)
      ? body.names
      : body.name
        ? [body.name]
        : [];

    // Sanitize and validate input
    const seen = new Set<string>();
    const validNames = rawNames
      .map((n) => (typeof n === "string" ? n.trim() : ""))
      .filter((name) => {
        if (
          !name ||
          name.length > 50 ||
          seen.has(name) ||
          !/^[A-Za-z0-9\s\-_.]+$/.test(name) // Valid: letters, numbers, space, -, _, .
        ) {
          return false;
        }
        seen.add(name);
        return true;
      });

    if (validNames.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one valid position name is required (max 50 characters, no special symbols).",
        },
        { status: 400 }
      );
    }

    // Check existing names in DB
    const existing = await db.position.findMany({
      where: {
        Name: { in: validNames },
        IsDeleted: false,
      },
      select: { Name: true },
    });

    const existingNames = new Set(existing.map((e) => e.Name));
    const namesToInsert = validNames.filter((n) => !existingNames.has(n));

    // If none are insertable
    if (namesToInsert.length === 0) {
      return NextResponse.json(
        {
          error: "All provided positions already exist.",
          skipped: [...existingNames],
        },
        { status: 409 }
      );
    }

    // Insert new positions
    const created = await db.position.createMany({
      data: namesToInsert.map((name) => ({ Name: name })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Positions processed.",
        added: namesToInsert,
        skipped: [...existingNames],
        count: created.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /positions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Soft delete a position
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Valid ID is required" },
        { status: 400 }
      );
    }

    const pos = await db.position.findUnique({
      where: { PositionID: Number(id) },
    });

    if (!pos || pos.IsDeleted) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    await db.position.update({
      where: { PositionID: Number(id) },
      data: { IsDeleted: true },
    });

    return NextResponse.json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("DELETE /positions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
