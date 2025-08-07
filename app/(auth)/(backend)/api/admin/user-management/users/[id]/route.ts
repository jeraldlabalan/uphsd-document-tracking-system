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

    // Fetch the role information to determine if it's Admin
    const role = await db.role.findUnique({
      where: { RoleID: roleId },
      select: { RoleName: true },
    });

    const roleName = role?.RoleName?.trim().toLowerCase() ?? "";
    const isAdmin = roleName === "admin";

    // Set departmentId to null if Admin
    const deptIdForUpdate = isAdmin ? null : (departmentId ?? null);

    // Optional: If Admin and departmentId is not null, reject the request
    if (isAdmin && departmentId !== null) {
      return NextResponse.json(
        { message: "Admin role must not have a department assigned." },
        { status: 400 }
      );
    }

    // Hash password if provided
    let hashedPassword = undefined;
    if (password && password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const updatedUserData: UpdateUserData = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      MobileNumber: mobile,
      Sex: sex,
      RoleID: roleId,
      DepartmentID: deptIdForUpdate,
      PositionID: positionId,
      EmployeeID: employeeId,
    };

    if (hashedPassword) {
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
