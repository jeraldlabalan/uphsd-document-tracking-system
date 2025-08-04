// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

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
//       departmentId: user.DepartmentID,
//       departmentName: user.Department?.Name || "",
//       positionId: user.PositionID,
//       positionName: user.Position?.Name || "",
//       roleId: user.RoleID,
//       roleName: user.Role.RoleName,
//       isActive: user.IsActive,
//       profilePicture: user.ProfilePicture ?? null,
//       hasPassword: true, // if needed
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
//       DepartmentID: departmentId || null,
//       PositionID: positionId,
//       EmployeeID: employeeId,
//       IsActive: isActive,
//     };

//     if (password && password.trim().length > 0) {
//       updateData.Password = password;
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

interface Params {
  id: string;
}

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

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user.UserID,
      firstName: user.FirstName,
      lastName: user.LastName,
      email: user.Email,
      mobile: user.MobileNumber,
      sex: user.Sex,
      employeeId: user.EmployeeID,
      departmentId: user.DepartmentID,
      positionId: user.PositionID,
      roleId: user.RoleID,
      profilePicture: user.ProfilePicture,
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
      isActive,
    } = body;

    const updateData: any = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      MobileNumber: mobile,
      Sex: sex,
      RoleID: roleId,
      DepartmentID: departmentId || null,
      PositionID: positionId,
      EmployeeID: employeeId,
      IsActive: isActive,
    };

    if (password?.trim()) {
      updateData.Password = password;
    }

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
