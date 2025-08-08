import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = verify(token, JWT_SECRET) as any;
    console.log('Decoded token:', decoded);

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isEmployeeRoute = request.nextUrl.pathname.startsWith('/employee2');

    if (isAdminRoute && decoded.Role !== 'Admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (isEmployeeRoute && decoded.Role !== 'Employee') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // If role matches route, continue
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*'], // Automatically triggers on these routes
};
