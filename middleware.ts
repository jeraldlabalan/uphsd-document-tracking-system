import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  // Skip check for login or unauthorized pages to avoid loops
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/unauthorized")
  ) {
    return NextResponse.next();
  }

  try {
    if (!token) throw new Error("No token");
    const decoded = verify(token, JWT_SECRET) as any;

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const isEmployeeRoute = request.nextUrl.pathname.startsWith("/employee2");

    if (isAdminRoute && decoded.role !== "Admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (isEmployeeRoute && decoded.role !== "Employee") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin1/:path*", "/employee1/:path*"],
};
