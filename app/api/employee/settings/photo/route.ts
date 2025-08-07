import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided." }, { status: 401 });
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "JWT secret not configured." }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { UserID: string };
    const userId = Number(decoded.UserID);
  try {
    // 1. Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // 2. Read the file into a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Make a unique filename
    const filename = `${Date.now()}-${file.name}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

    // 4. Save the file to /public/uploads
    await writeFile(uploadPath, buffer);

    // 5. Update user in DB (replace with your auth logic!)
    await db.user.update({
      where: { UserID: userId },
      data: {
        ProfilePicture: `/uploads/${filename}`,
      },
    });
    console.log("File uploaded successfully:", filename);
    console.log("Received file:", file);
    console.log("FormData keys:", [...formData.keys()]);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
};