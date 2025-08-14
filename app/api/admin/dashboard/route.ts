import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Use the new auth utility function
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Get current date and calculate date ranges
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch all required data in parallel
    const [totalUsers, totalDocs, totalDepartments, pendingSignatures] =
      await Promise.all([
        // Basic counts - only active users regardless of role
        db.user.count({
          where: {
            IsActive: true,
            IsDeleted: false,
          },
        }),

        // Only count documents that are not deleted and have one of the 5 specific statuses
        db.document.count({
          where: {
            IsDeleted: false,
            Status: {
              in: [
                "In-Process",
                "On Hold",
                "Approved",
                "Completed",
                "Awaiting-Completion",
              ],
            },
          },
        }),

        // Only count departments that are not deleted
        db.department.count({
          where: {
            IsDeleted: false,
          },
        }),

        // Pending signatures - only non-deleted requests
        db.documentRequest.count({
          where: {
            Status: { StatusName: "Pending" },
            IsDeleted: false,
          },
        }),
      ]);

    // Process weekly data (4 weeks of current month)
    const weeklyData = {
      inProcess: Array(4).fill(0),
      completed: Array(4).fill(0),
      onHold: Array(4).fill(0),
      approved: Array(4).fill(0),
      awaitingCompletion: Array(4).fill(0),
    };

    // Get current month and year
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate 4 weeks of the current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Each week is approximately 7-8 days
    const daysPerWeek = Math.ceil(totalDays / 4);

    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(
        currentYear,
        currentMonth,
        1 + week * daysPerWeek
      );
      const weekEnd = new Date(
        currentYear,
        currentMonth,
        Math.min(1 + week * daysPerWeek + daysPerWeek - 1, totalDays),
        23,
        59,
        59
      );

      // Ensure weekEnd doesn't go beyond month end
      if (weekEnd > lastDayOfMonth) {
        weekEnd.setTime(lastDayOfMonth.getTime());
      }

      // Count documents CREATED in this week of the month
      const weeklyStats = await db.document.groupBy({
        by: ["Status"],
        where: {
          IsDeleted: false,
          Status: {
            in: [
              "In-Process",
              "On Hold",
              "Approved",
              "Completed",
              "Awaiting-Completion",
            ],
          },
          CreatedAt: { gte: weekStart, lte: weekEnd },
        },
        _count: { Status: true },
      });

      weeklyStats.forEach((stat: any) => {
        const status = stat.Status;
        // Use exact status matching for accurate counting
        if (status === "In-Process")
          weeklyData.inProcess[week] = stat._count.Status;
        else if (status === "Completed")
          weeklyData.completed[week] = stat._count.Status;
        else if (status === "On Hold")
          weeklyData.onHold[week] = stat._count.Status;
        else if (status === "Approved")
          weeklyData.approved[week] = stat._count.Status;
        else if (status === "Awaiting-Completion")
          weeklyData.awaitingCompletion[week] = stat._count.Status;
      });
    }

    // Process monthly data (current year only) - count documents created in each month
    const monthlyData = {
      inProcess: Array(12).fill(0),
      completed: Array(12).fill(0),
      onHold: Array(12).fill(0),
      approved: Array(12).fill(0),
      awaitingCompletion: Array(12).fill(0),
    };

    for (let i = 0; i < 12; i++) {
      // Count documents CREATED in each month of the current year
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59);

      const monthlyStats = await db.document.groupBy({
        by: ["Status"],
        where: {
          IsDeleted: false,
          Status: {
            in: [
              "In-Process",
              "On Hold",
              "Approved",
              "Completed",
              "Awaiting-Completion",
            ],
          },
          CreatedAt: { gte: monthStart, lte: monthEnd },
        },
        _count: { Status: true },
      });

      monthlyStats.forEach((stat: any) => {
        const status = stat.Status;
        // Use exact status matching for accurate counting
        if (status === "In-Process")
          monthlyData.inProcess[i] = stat._count.Status;
        else if (status === "Completed")
          monthlyData.completed[i] = stat._count.Status;
        else if (status === "On Hold")
          monthlyData.onHold[i] = stat._count.Status;
        else if (status === "Approved")
          monthlyData.approved[i] = stat._count.Status;
        else if (status === "Awaiting-Completion")
          monthlyData.awaitingCompletion[i] = stat._count.Status;
      });
    }

    // Process yearly data - dynamic from 2025 onwards
    const baseYear = 2025;
    const currentYearForYearly = now.getFullYear();
    const yearlyData = {
      inProcess: [] as number[],
      completed: [] as number[],
      onHold: [] as number[],
      approved: [] as number[],
      awaitingCompletion: [] as number[],
    };

    // Get data for each year from baseYear to currentYear
    for (let year = baseYear; year <= currentYearForYearly; year++) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);

      const yearlyStats = await db.document.groupBy({
        by: ["Status"],
        where: {
          IsDeleted: false,
          Status: {
            in: [
              "In-Process",
              "On Hold",
              "Approved",
              "Completed",
              "Awaiting-Completion",
            ],
          },
          CreatedAt: { gte: yearStart, lte: yearEnd },
        },
        _count: { Status: true },
      });

      // Initialize counts for this year
      let inProcess = 0,
        completed = 0,
        onHold = 0,
        approved = 0,
        awaitingCompletion = 0;

      yearlyStats.forEach((stat: any) => {
        const status = stat.Status;
        // Use exact status matching instead of includes() to avoid false matches
        if (status === "In-Process") inProcess = stat._count.Status;
        else if (status === "Completed") completed = stat._count.Status;
        else if (status === "On Hold") onHold = stat._count.Status;
        else if (status === "Approved") approved = stat._count.Status;
        else if (status === "Awaiting-Completion")
          awaitingCompletion = stat._count.Status;
      });

      // Add data for this year
      yearlyData.inProcess.push(inProcess);
      yearlyData.completed.push(completed);
      yearlyData.onHold.push(onHold);
      yearlyData.approved.push(approved);
      yearlyData.awaitingCompletion.push(awaitingCompletion);
    }

    return NextResponse.json(
      {
        summary: {
          totalUsers,
          totalDocs,
          totalDepartments,
          pendingSignatures,
        },
        charts: {
          weekly: weeklyData,
          monthly: monthlyData,
          yearly: yearlyData,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
          Pragma: "public",
          Expires: new Date(Date.now() + 300000).toUTCString(),
        },
      }
    );
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
