import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Fetch all users including terminated (IsDeleted = true)
    const users = await db.user.findMany({
      select: {
        UserID: true,
        FirstName: true,
        LastName: true,
        Email: true,
        MobileNumber: true,
        Sex: true,
        EmployeeID: true,
        IsActive: true,
        IsDeleted: true,
        CreatedAt: true,
        Department: { select: { Name: true } },
        Position: { select: { Name: true } },
        Role: { select: { RoleName: true } },
      },
    });

    // Map users to frontend shape
    const formatted = users.map((user) => ({
      id: user.UserID,
      name: `${user.FirstName} ${user.LastName}`,
      email: user.Email,
      mobile: user.MobileNumber,
      sex: user.Sex,
      employeeId: user.EmployeeID,
      department: user.Department?.Name || "N/A",
      position: user.Position.Name,
      role: user.Role.RoleName,
      status: user.IsDeleted
        ? "Terminated"
        : user.IsActive
          ? "Active"
          : "Inactive",
      dateCreated: user.CreatedAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
