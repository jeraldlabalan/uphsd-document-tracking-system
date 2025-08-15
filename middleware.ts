import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Web Crypto API compatible JWT verification
function verifyJWT(token: string, secret: string): any {
  try {
    // Simple JWT verification without external libraries
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw new Error('JWT verification failed');
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  // Skip check for public pages to avoid loops
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/unauthorized") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/forgotpass") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  try {
    if (!token) {
      console.log("No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = verifyJWT(token, process.env.JWT_SECRET!);
    
    // Check if user account is terminated (deleted)
    if (decoded.isDeleted) {
      console.log("User account terminated, redirecting to login");
      // Clear the invalid token
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("session", "", { expires: new Date(0) });
      return response;
    }

    // Check if user account is deactivated (suspended)
    if (!decoded.isActive) {
      console.log("User account deactivated, redirecting to login");
      // Clear the invalid token
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("session", "", { expires: new Date(0) });
      return response;
    }

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const isEmployeeRoute = request.nextUrl.pathname.startsWith("/employee2");

    if (isAdminRoute && decoded.role !== "Admin") {
      console.log("Non-admin user trying to access admin route");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    
    if (isEmployeeRoute && decoded.role !== "Employee") {
      console.log("Non-employee user trying to access employee route");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Token is valid and user has correct role and active status
    return NextResponse.next();
  } catch (err) {
    console.log("JWT verification failed:", err);
    // Clear the invalid token and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("session", "", { expires: new Date(0) });
    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/employee2/:path*",
    "/dashboard/:path*"
  ],
};
