import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface DecodedToken {
  UserID: number;
  email: string;
  role: "Admin" | "Employee";
  isActive: boolean;
  isDeleted: boolean;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token and return decoded user information
 */
export function verifyToken(request: NextRequest): DecodedToken | null {
  try {
    const token = request.cookies.get("session")?.value;
    if (!token) return null;

    const decoded = verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify user authentication and check if account is active
 */
export async function verifyAuth(request: NextRequest): Promise<{
  user: DecodedToken;
  response?: NextResponse;
} | null> {
  const decoded = verifyToken(request);
  
  if (!decoded) {
    return null;
  }

  // Check if user account is terminated (deleted)
  if (decoded.isDeleted) {
    return null;
  }

  // Check if user account is deactivated (suspended)
  if (!decoded.isActive) {
    return null;
  }

  // Optional: Double-check with database for additional security
  try {
    const user = await db.user.findUnique({
      where: { UserID: decoded.UserID },
      select: { IsActive: true, IsDeleted: true }
    });

    if (!user || user.IsDeleted || !user.IsActive) {
      return null;
    }
  } catch (error) {
    console.error("Error verifying user status:", error);
    // If database check fails, still allow access based on JWT
    // This prevents system downtime from blocking all users
  }

  return { user: decoded };
}

/**
 * Verify admin authentication
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{
  user: DecodedToken;
  response?: NextResponse;
} | null> {
  const authResult = await verifyAuth(request);
  
  if (!authResult || authResult.user.role !== "Admin") {
    return null;
  }

  return authResult;
}

/**
 * Verify employee authentication
 */
export async function verifyEmployeeAuth(request: NextRequest): Promise<{
  user: DecodedToken;
  response?: NextResponse;
} | null> {
  const authResult = await verifyAuth(request);
  
  if (!authResult || authResult.user.role !== "Employee") {
    return null;
  }

  return authResult;
}
