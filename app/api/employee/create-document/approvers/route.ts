// /app/api/approvers/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
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

    // Get department ID from query parameters
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    let whereClause: any = {
      UserID: { not: decoded.UserID }, // Exclude the current user
      IsActive: true,
      IsDeleted: false,
      Role: { RoleID: 2 }, // Adjust as needed
    };

    // If department ID is provided, filter by department
    if (departmentId && departmentId !== 'null') {
      whereClause.DepartmentID = parseInt(departmentId);
    }

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        UserID: true,
        FirstName: true,
        LastName: true,
        DepartmentID: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch approvers:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
