// import { verify } from "jsonwebtoken";
// import { cookies } from "next/headers";
// import { db } from "@/lib/db";

// export async function fetchAdminDocumentOverview() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("session")?.value;

//   if (!token) throw new Error("Not authenticated");

//   const decoded = verify(token, process.env.JWT_SECRET!) as { role: string };

//   if (decoded.role !== "Admin") throw new Error("Not authorized");

//   const [
//     totalDocuments,
//     documentsByType,
//     recentDocuments,
//     documentsPerDepartment,
//     deletedDocuments,
//     activeDocuments,
//   ] = await Promise.all([
//     db.document.count(),

//     db.document.groupBy({
//       by: ["DocumentType"],
//       _count: true,
//       where: { IsDeleted: false },
//     }),

//     db.document.findMany({
//       where: { IsDeleted: false },
//       orderBy: { CreatedAt: "desc" },
//       take: 5,
//       include: {
//         Creator: {
//           select: {
//             FirstName: true,
//             LastName: true,
//           },
//         },
//         Department: {
//           select: {
//             Name: true,
//           },
//         },
//       },
//     }),

//     db.document.groupBy({
//       by: ["DepartmentID"],
//       _count: { _all: true },
//       where: { IsDeleted: false },
//     }),

//     db.document.count({ where: { IsDeleted: true } }),

//     db.document.count({ where: { IsDeleted: false } }),
//   ]);

//   // Map departmentID to names (e.g. in a frontend or extend here by joining if needed)
//   const departmentMap = await db.department.findMany({
//     select: { DepartmentID: true, Name: true },
//   });

//   const departmentLookup = Object.fromEntries(
//     departmentMap.map((dep) => [dep.DepartmentID, dep.Name])
//   );

//   return {
//     totalDocuments,
//     documentTypes: documentsByType.map((doc) => ({
//       type: doc.DocumentType ?? "Unknown",
//       count: doc._count,
//     })),
//     recentDocuments: recentDocuments.map((doc) => ({
//       id: doc.DocumentID,
//       title: doc.Title,
//       type: doc.Type,
//       department: doc.Department?.Name || "N/A",
//       createdBy: `${doc.Creator.FirstName} ${doc.Creator.LastName}`,
//       createdAt: doc.CreatedAt,
//     })),
//     documentsPerDepartment: documentsPerDepartment.map((entry) => ({
//       department: entry.DepartmentID !== null ? (departmentLookup[entry.DepartmentID] || "Unassigned") : "Unassigned",
//       count: entry._count._all,
//     })),
//     statusCount: {
//       deleted: deletedDocuments,
//       active: activeDocuments,
//     },
//   };
// }
