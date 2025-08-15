import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");
    
    if (!fileName) {
      return NextResponse.json({ error: "File name parameter is required" }, { status: 400 });
    }

    // Test different possible file paths
    const possiblePaths = [
      path.join(process.cwd(), "public", "uploads", "documents", fileName),
      path.join(process.cwd(), "public", "uploads", fileName),
      path.join(process.cwd(), "public", fileName),
    ];

    const results = possiblePaths.map(filePath => {
      const exists = existsSync(filePath);
      const stats = exists ? require("fs").statSync(filePath) : null;
      return {
        path: filePath,
        exists,
        size: exists ? stats.size : null,
        isFile: exists ? stats.isFile() : null,
        relativePath: path.relative(process.cwd(), filePath)
      };
    });

    return NextResponse.json({
      fileName,
      testResults: results,
      currentWorkingDir: process.cwd(),
      publicDir: path.join(process.cwd(), "public"),
      uploadsDir: path.join(process.cwd(), "public", "uploads"),
      documentsDir: path.join(process.cwd(), "public", "uploads", "documents")
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to test file access", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
