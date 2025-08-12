import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ GET: Fetch all active departments
export async function GET() {
  try {
    const departments = await db.department.findMany({
      where: { IsDeleted: false },
      select: { DepartmentID: true, Name: true },
      orderBy: { Name: "asc" },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("GET /departments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ POST: Add single or multiple new departments with validation + detailed feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept { name: "HR" } or { names: ["HR", "Finance"] }
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
          !/^[A-Za-z0-9\s\-_.]+$/.test(name) // letters, numbers, spaces, -, _, .
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
            "At least one valid department name is required (max 50 characters, no special symbols).",
        },
        { status: 400 }
      );
    }

    // Check existing names in DB
    const existing = await db.department.findMany({
      where: {
        Name: { in: validNames },
        IsDeleted: false,
      },
      select: { Name: true },
    });

    const existingNames = new Set(existing.map((e) => e.Name));
    const namesToInsert = validNames.filter((n) => !existingNames.has(n));

    if (namesToInsert.length === 0) {
      return NextResponse.json(
        {
          error: "All provided departments already exist.",
          skipped: [...existingNames],
        },
        { status: 409 }
      );
    }

    // Insert new departments
    const created = await db.department.createMany({
      data: namesToInsert.map((name) => ({ Name: name })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Departments processed.",
        added: namesToInsert,
        skipped: [...existingNames],
        count: created.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /departments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Soft delete a department
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Valid ID is required" },
        { status: 400 }
      );
    }

    const dept = await db.department.findUnique({
      where: { DepartmentID: Number(id) },
    });

    if (!dept || dept.IsDeleted) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    await db.department.update({
      where: { DepartmentID: Number(id) },
      data: { IsDeleted: true },
    });

    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("DELETE /departments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
