import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Check if JWT_SECRET is set
    if (!JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

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

    const formData = await req.formData();
    const file = formData.get("profilePicture") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `profile-${timestamp}${fileExtension}`;

    // Save to uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("Error creating upload directory:", err);
      return NextResponse.json(
        { message: "Failed to create upload directory" },
        { status: 500 }
      );
    }

    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error("Error writing file:", err);
      return NextResponse.json(
        { message: "Failed to save file" },
        { status: 500 }
      );
    }

    // Update user's profile picture in database
    let updatedUser;
    try {
      updatedUser = await db.user.update({
        where: { Email: decoded.email },
        data: {
          ProfilePicture: `/uploads/profiles/${fileName}`,
          UpdatedAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error("Database error updating user:", dbError);
      return NextResponse.json(
        { message: "Failed to update user profile in database" },
        { status: 500 }
      );
    }

    // Create activity log
    await db.activityLog.create({
      data: {
        PerformedBy: updatedUser.UserID,
        Action: "Updated Profile Picture",
        TargetType: "User",
        TargetID: updatedUser.UserID,
        Remarks: `Updated profile picture for user ${updatedUser.Email}`,
      },
    });

    return NextResponse.json({
      message: "Profile picture updated successfully",
      profilePicture: `/uploads/profiles/${fileName}`,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        message: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
