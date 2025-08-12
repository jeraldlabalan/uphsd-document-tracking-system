import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
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

    const formatted = users.map((user) => ({
      id: user.UserID,
      name: `${user.FirstName ?? ""} ${user.LastName ?? ""}`.trim(),
      email: user.Email ?? "",
      mobile: user.MobileNumber ?? "",
      sex: user.Sex ?? "",
      employeeId: user.EmployeeID ?? "",
      department: user.Department?.Name ?? "",
      position: user.Position?.Name ?? "",
      role: user.Role?.RoleName ?? "",
      status: user.IsDeleted
        ? "Terminated"
        : user.IsActive
          ? "Active"
          : "Inactive",
      dateCreated: user.CreatedAt?.toISOString?.() ?? "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching users in API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
