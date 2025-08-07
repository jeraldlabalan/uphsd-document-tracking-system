import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function fetchAdminDashboardStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    console.log("Token from cookies:", token);
  if (!token) throw new Error("Not authenticated");

  const decoded = verify(token, process.env.JWT_SECRET!) as { role: string };

  if (decoded.role !== "Admin") throw new Error("Not authorized");

  const [totalUsers, totalDocs, pendingApprovals, departments, recentUsers] = await Promise.all([
    db.user.count(),

    db.document.count(),

    db.documentRequest.count({
      where: {
        Status: {
            StatusName: "Pending",
        }
      },
    }),

    db.department.count(),

    db.user.findMany({
        where: {
            IsActive: true,
        },
        orderBy: { CreatedAt: "desc" },
        take: 5,
        include: {
            Department: true,
            Role: true,
        },
        }),
    //   orderBy: { lastLogin: "desc" },
    ]);
  return {
    totalUsers,
    totalDocs,
    pendingApprovals,
    departments,
    recentUsers: recentUsers.map(user => ({
      id: user.UserID,
      name: user.FirstName + " " + user.LastName,
      email: user.Email,
      department: user.Department?.Name,
      role: user.Role?.RoleName,
    //   lastLogin: user.lastLogin,
      isActive: user.IsActive,
      profilePicture: user.ProfilePicture || "/profile-placeholder.jpg",
    })),
  };
}