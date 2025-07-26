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
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
      console.log("Decoded token:", decoded);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { UserID: decoded.UserID },
      include: { Department: true, Role: true },
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
      Position: user.Position,
      Department: user.Department?.Name || null,
      ProfilePicture: user.ProfilePicture,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { FirstName, LastName, MobileNumber, Position, DepartmentID } = body;

    const updatedUser = await db.user.update({
      where: { UserID: decoded.UserID },
      data: {
        FirstName,
        LastName,
        MobileNumber,
        Position,
        DepartmentID: DepartmentID ? parseInt(DepartmentID) : undefined,
      },
    });

    return NextResponse.json({ message: "Profile updated", updatedUser });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

