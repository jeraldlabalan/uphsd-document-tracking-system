import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

interface UserWithRole {
  id: number; // ✅ Add UserID
  email: string;
  password: string;
  role: "Admin" | "Employee";
  FirstName: string;
  LastName: string;
  isActive: boolean; // Add isActive field
  isDeleted: boolean; // Add isDeleted field
}

async function findUserByEmail(email: string): Promise<UserWithRole | null> {
  const user = await db.user.findFirst({
    where: { Email: { equals: email, mode: "insensitive" } },
    include: { Role: true },
  });

  if (!user) return null;

  const roleName =
    user.Role.RoleName.trim().toLowerCase() === "admin" ? "Admin" : "Employee";

  return {
    id: user.UserID, // ✅ Save ID
    email: user.Email,
    password: user.Password,
    role: roleName,
    FirstName: user.FirstName || "", // Handle null values
    LastName: user.LastName || "", // Handle null values
    isActive: user.IsActive, // ✅ Save isActive
    isDeleted: user.IsDeleted, // ✅ Save isDeleted
  };
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and Password are required." },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Email is not valid." },
        { status: 400 }
      );
    }

    if (!email.toLowerCase().endsWith("@cvsu.edu.ph")) {
      return NextResponse.json(
        { message: "Email must be a valid @cvsu.edu.ph address." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // ✅ Use bcrypt to compare password hashes
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check if user account is terminated (deleted)
    if (user.isDeleted) {
      return NextResponse.json(
        { message: "Account has been terminated. Please contact an administrator." },
        { status: 403 }
      );
    }

    // Check if user account is deactivated (suspended)
    if (!user.isActive) {
      return NextResponse.json(
        { message: "Account has been deactivated. Please contact an administrator." },
        { status: 403 }
      );
    }

    // ✅ Create secure JWT with UserID
    const token = sign(
      { UserID: user.id, email: user.email, role: user.role, isActive: user.isActive, isDeleted: user.isDeleted },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
