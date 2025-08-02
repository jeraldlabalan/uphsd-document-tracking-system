import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Clear the JWT cookie by setting it to an expired date
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    expires: new Date(0), // Immediately expires
  });

  return NextResponse.json({ message: "Logged out successfully" });
}