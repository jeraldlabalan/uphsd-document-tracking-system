// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import bcrypt from "bcryptjs";

// interface Params {
//   id: string;
// }

// export async function GET(request: Request, { params }: { params: Params }) {
//   const userId = Number(params.id);
//   if (!userId || isNaN(userId)) {
//     return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
//   }

//   try {
//     const user = await db.user.findUnique({
//       where: { UserID: userId },
//       select: {
//         UserID: true,
//         FirstName: true,
//         LastName: true,
//         Email: true,
//         MobileNumber: true,
//         Sex: true,
//         EmployeeID: true,
//         RoleID: true,
//         DepartmentID: true,
//         PositionID: true,
//         ProfilePicture: true,
//         Role: { select: { RoleName: true } },
//         Department: { select: { Name: true } },
//         Position: { select: { Name: true } },
//         IsActive: true,
//       },
//     });

//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       id: user.UserID,
//       firstName: user.FirstName,
//       lastName: user.LastName,
//       email: user.Email,
//       mobile: user.MobileNumber,
//       sex: user.Sex,
//       employeeId: user.EmployeeID,
//       roleId: user.RoleID,
//       departmentId: user.DepartmentID,
//       positionId: user.PositionID,
//       profilePicture: user.ProfilePicture,
//       isActive: user.IsActive,
//     });
//   } catch (error) {
//     console.error("GET user error:", error);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }

// export async function PUT(request: Request, { params }: { params: Params }) {
//   const userId = Number(params.id);
//   if (!userId || isNaN(userId)) {
//     return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
//   }

//   try {
//     const body = await request.json();
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       mobile,
//       sex,
//       roleId,
//       departmentId,
//       positionId,
//       employeeId,
//       isActive,
//     } = body;

//     const updateData: any = {
//       FirstName: firstName,
//       LastName: lastName,
//       Email: email,
//       MobileNumber: mobile,
//       Sex: sex,
//       RoleID: roleId,
//       PositionID: positionId,
//       EmployeeID: employeeId,
//       IsActive: isActive,
//     };

//     // Set department if not Employee; otherwise null
//     const roleRecord = await db.role.findUnique({
//       where: { RoleID: roleId },
//     });
//     const roleName = roleRecord?.RoleName?.toLowerCase() || "";
//     updateData.DepartmentID =
//       roleName === "employee" ? null : (departmentId ?? null);

//     // Only hash & include password if provided
//     if (password?.trim()) {
//       const hashed = await bcrypt.hash(password, 10);
//       updateData.Password = hashed;
//     }

//     await db.user.update({
//       where: { UserID: userId },
//       data: updateData,
//     });

//     return NextResponse.json({ message: "User updated successfully" });
//   } catch (error) {
//     console.error("PUT user error:", error);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }









import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

interface Params {
  id: string;
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
      isActive,
    } = body;

    // Get role name (to determine if departmentID should be null)
    const roleRecord = await db.role.findUnique({
      where: { RoleID: roleId },
    });
    const roleName = roleRecord?.RoleName?.toLowerCase() || "";

    // Build update object (include everything except password initially)
    const updateData: any = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      MobileNumber: mobile,
      Sex: sex,
      RoleID: roleId,
      PositionID: positionId,
      EmployeeID: employeeId,
      IsActive: isActive,
      DepartmentID: roleName === "employee" ? null : (departmentId ?? null),
    };

    // Only hash and include password if it's provided
    if (password?.trim()) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.Password = hashed;
    }

    // Update user
    await db.user.update({
      where: { UserID: userId },
      data: updateData,
    });

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
