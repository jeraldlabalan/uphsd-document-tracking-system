import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    console.log("Token from cookies:", token);

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    interface JwtPayload {
      email?: string;
      UserID?: number;
      iat?: number;
      exp?: number;
    }
    let decoded: JwtPayload;
    try {
      decoded = verify(token, JWT_SECRET) as JwtPayload;
      console.log("Decoded token:", decoded);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { Email: decoded.email },
      include: {
        Department: true,
        Position: true,
        Role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
      EmployeeID: user.EmployeeID,
      MobileNumber: user.MobileNumber,
      Sex: user.Sex,
      PositionID: user.PositionID,
      Position: user.Position?.Name || null,
      DepartmentID: user.DepartmentID,
      Department: user.Department?.Name || null,
      Role: user.Role?.RoleName || null,
      ProfilePicture: user.ProfilePicture,
      CreatedAt: user.CreatedAt,
      UpdatedAt: user.UpdatedAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
