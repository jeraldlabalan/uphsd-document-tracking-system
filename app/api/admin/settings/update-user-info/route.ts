import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      employeeId,
      mobileNumber,
      sex,
      position,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await db.user.findFirst({
      where: {
        Email: email,
        UserID: { not: decoded.UserID || decoded.userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already taken by another user" },
        { status: 400 }
      );
    }

    // Get position ID if name is provided
    let positionId = null;

    if (position) {
      const pos = await db.position.findFirst({
        where: { Name: position, IsDeleted: false },
      });
      positionId = pos?.PositionID || null;
    }

    // Update user information
    const updatedUser = await db.user.update({
      where: { Email: decoded.email },
      data: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        EmployeeID: employeeId,
        MobileNumber: mobileNumber,
        Sex: sex,
        PositionID: positionId,
        UpdatedAt: new Date(),
      },
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        PerformedBy: updatedUser.UserID,
        Action: "Updated Profile Information",
        TargetType: "User",
        TargetID: updatedUser.UserID,
      },
    });

    return NextResponse.json({
      message: "User information updated successfully",
      user: {
        FirstName: updatedUser.FirstName,
        LastName: updatedUser.LastName,
        Email: updatedUser.Email,
        EmployeeID: updatedUser.EmployeeID,
        MobileNumber: updatedUser.MobileNumber,
        Sex: updatedUser.Sex,
        PositionID: updatedUser.PositionID,
        UpdatedAt: updatedUser.UpdatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
