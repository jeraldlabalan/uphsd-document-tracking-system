import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

type JwtPayload = {
  UserID: number;
  iat: number;
  exp: number;
};

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    console.log("Token Retrieved:" + token);

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = verify(token, JWT_SECRET) as JwtPayload;
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType");
    const department = searchParams.get("department");
    const date = searchParams.get("date");
    const summary = searchParams.get("summary");

    // If summary is requested, return summary statistics
    if (summary === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Build where clause for summary based on filters
      const summaryWhere: Record<string, unknown> = {
        IsDeleted: false,
        Timestamp: {
          gte: today,
          lt: tomorrow,
        },
      };

      if (targetType && targetType !== "All Targets")
        summaryWhere.TargetType = targetType;
      if (department && department !== "All Departments") {
        summaryWhere.User = {
          Department: {
            Name: department,
          },
        };
      }

      // Total activity today
      const totalActivityToday = await db.activityLog.count({
        where: summaryWhere,
      });

      // Document-related activity today
      const documentActivityToday = await db.activityLog.count({
        where: {
          ...summaryWhere,
          TargetType: {
            in: [
              "Document",
              "DocumentVersion",
              "DocumentRequest",
              "SignaturePlaceholder",
            ],
          },
        },
      });

      // User-related activity today
      const userActivityToday = await db.activityLog.count({
        where: {
          ...summaryWhere,
          TargetType: {
            in: ["User", "Department", "Role"],
          },
        },
      });

      return NextResponse.json({
        totalActivityToday,
        documentActivityToday,
        userActivityToday,
      });
    }

    const where: Record<string, unknown> = {
      IsDeleted: false,
    };

    if (targetType && targetType !== "All Targets")
      where.TargetType = targetType;
    if (department && department !== "All Departments") {
      where.User = {
        Department: {
          Name: department,
        },
      };
    }
    if (date && date !== "All Dates") {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.CreatedAt = { gte: startDate, lte: endDate };
    }

    const totallog = await db.activityLog.count({
      where,
    });
    const logs = await db.activityLog.findMany({
      where,
      include: {
        User: {
          select: {
            FirstName: true,
            LastName: true,
            Department: { select: { Name: true } },
            Role: { select: { RoleName: true } },
          },
        },
      },
      orderBy: {
        Timestamp: "desc",
      },
    });

    console.log("Activity Logs: ", logs);
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
