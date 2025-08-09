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
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = verify(token, JWT_SECRET) as JwtPayload;
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const documentType = searchParams.get("documentType");
    const date = searchParams.get("date");

    const where: any = {
      IsDeleted: false,
    };

    if (action && action !== "All Actions") where.Action = action;
    if (documentType && documentType !== "All Types") where.DocumentType = documentType;
    if (date && date !== "All Dates") {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.CreatedAt = { gte: startDate, lte: endDate };
    }

    const totallog = await db.activityLog.count({
      where,
    })
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
