import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

interface Params {
  id: string;
}

type UpdateUserData = {
  FirstName?: string | null;
  LastName?: string | null;
  Email?: string;
  Password?: string;
  MobileNumber?: string | null;
  Sex?: string | null;
  RoleID?: number;
  DepartmentID?: number | null;
  PositionID?: number;
  EmployeeID?: string | null;
  IsActive?: boolean;
};

export async function GET(request: Request, { params }: { params: Params }) {
  const userId = Number(params.id);
  if (!userId || isNaN(userId)) {
    return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({
      where: { UserID: userId },
      select: {
        UserID: true,
        FirstName: true,
        LastName: true,
        Email: true,
        MobileNumber: true,
        Sex: true,
        EmployeeID: true,
        RoleID: true,
        DepartmentID: true,
        PositionID: true,
        ProfilePicture: true,
        Role: { select: { RoleName: true } },
        Department: { select: { Name: true } },
        Position: { select: { Name: true } },
        IsActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.UserID,
      firstName: user.FirstName,
      lastName: user.LastName,
      email: user.Email,
      mobile: user.MobileNumber,
      sex: user.Sex,
      employeeId: user.EmployeeID,
      roleId: user.RoleID,
      departmentId: user.DepartmentID,
      positionId: user.PositionID,
      profilePicture: user.ProfilePicture,
      isActive: user.IsActive,
    });
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const userId = Number(params.id);
  if (!userId || isNaN(userId)) {
    return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Destructure fields from body (may be partial)
    const {
      firstName,
      lastName,
      email,
      password,
      mobile,
      sex,
      roleId,
      departmentId,
      positionId,
      employeeId,
    } = body;

    // If roleId is provided, fetch role info for admin check
    let isAdmin = false;
    if (typeof roleId === "number") {
      const role = await db.role.findUnique({
        where: { RoleID: roleId },
        select: { RoleName: true },
      });
      const roleName = role?.RoleName?.trim().toLowerCase() ?? "";
      isAdmin = roleName === "admin";
    }

    // Prepare data object only with fields provided in request
    const updatedUserData: UpdateUserData = {};

    if (firstName !== undefined) updatedUserData.FirstName = firstName;
    if (lastName !== undefined) updatedUserData.LastName = lastName;
    if (email !== undefined) updatedUserData.Email = email;
    if (mobile !== undefined) updatedUserData.MobileNumber = mobile;
    if (sex !== undefined) updatedUserData.Sex = sex;
    if (roleId !== undefined) updatedUserData.RoleID = roleId;
    if (positionId !== undefined) updatedUserData.PositionID = positionId;

    if (employeeId !== undefined) {
      // Check if the new EmployeeID already exists for another user
      if (employeeId) {
        const existingUser = await db.user.findFirst({
          where: {
            EmployeeID: employeeId,
            UserID: { not: userId }, // Exclude current user
          },
        });
        
        if (existingUser) {
          return NextResponse.json(
            { message: `Employee ID "${employeeId}" is already assigned to another user.` },
            { status: 400 }
          );
        }
      }
      updatedUserData.EmployeeID = employeeId;
    }

    // For DepartmentID, enforce Admin role condition:
    if (departmentId !== undefined) {
      if (isAdmin && departmentId !== null) {
        return NextResponse.json(
          { message: "Admin role must not have a department assigned." },
          { status: 400 }
        );
      }
      updatedUserData.DepartmentID = isAdmin ? null : departmentId;
    }

    // Hash password if provided and non-empty
    if (password !== undefined && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updatedUserData.Password = hashedPassword;
    }

    await db.user.update({
      where: { UserID: userId },
      data: updatedUserData,
    });

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}
