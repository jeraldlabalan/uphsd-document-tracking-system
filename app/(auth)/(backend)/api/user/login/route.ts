import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

interface UserWithRole {
  id: number;             // ✅ Add UserID
  email: string;
  password: string;
  role: "Admin" | "Employee";
  FirstName: string;
  LastName: string;
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
    id: user.UserID,     // ✅ Save ID
    email: user.Email,
    password: user.Password,
    role: roleName,
    FirstName: user.FirstName,
    LastName: user.LastName,
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

    // ✅ Create secure JWT with UserID
    const token = sign(
      { UserID: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // ✅ Set JWT in HttpOnly cookie
    const response = NextResponse.json(
      { role: user.role, message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
