import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    // Step 1: Extract session token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Decode token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { UserID: number };
    const userID = decoded.UserID;

    // Step 3: Fetch documents where user is creator OR approver
    const documents = await db.document.findMany({
      where: {
        OR: [
          { CreatedBy: userID }, // User is the creator
          {
            Requests: {
              some: {
                RecipientUserID: userID, // User is an approver
                IsDeleted: false,
              },
            },
          },
        ],
        IsDeleted: false,
      },
      include: {
        DocumentType: true,
        Department: true,
        Creator: {
          select: {
            FirstName: true,
            LastName: true,
          },
        },
        Versions: {
          where: { IsDeleted: false },
          orderBy: { VersionNumber: "desc" },
          take: 1,
        },
        Requests: {
          where: { IsDeleted: false },
          include: {
            Recipient: {
              select: {
                FirstName: true,
                LastName: true,
              },
            },
            Status: true,
          },
          orderBy: { RequestedAt: "desc" },
        },
      },
      orderBy: {
        CreatedAt: "desc",
      },
    });

    if (!documents || documents.length === 0) {
      return NextResponse.json({ docs: [] }, { status: 200 });
    }

    // Step 4: Format response - now each document appears only once
    const docs = documents.map((doc: any) => {
      const latestFilepath = doc.Versions?.[0]?.FilePath ?? "";
      
      // Find the user's role in this document (creator or approver)
      const isCreator = doc.CreatedBy === userID;
      const userRequest = doc.Requests?.find((req: any) => req.RecipientUserID === userID);
      
      // Determine document status based on user role and document state
      let status = "Unknown";
      
      if (isCreator) {
        // For creators, use the document's overall status or determine from requests
        if (doc.Status) {
          status = doc.Status;
        } else if (doc.Requests && doc.Requests.length > 0) {
          // Check if any requests are pending
          const hasPendingRequests = doc.Requests.some((req: any) => 
            req.Status?.StatusName === "In Process" || req.Status?.StatusName === "Pending"
          );
          status = hasPendingRequests ? "In Process" : "Completed";
        } else {
          status = "Draft"; // No requests means it's a draft
        }
      } else {
        // For approvers, use their specific request status
        status = userRequest?.Status?.StatusName ?? "Unknown";
      }
      
      return {
        id: doc.DocumentID, // Use DocumentID for editing
        documentId: doc.DocumentID, // Explicit DocumentID
        requestId: userRequest?.RequestID, // Keep RequestID for other operations
        name: doc.Title ?? "Untitled",
        type: doc.DocumentType?.TypeName ?? "Unknown",
        status: status,
        date: doc.CreatedAt.toISOString().split("T")[0],
        creator: `${doc.Creator?.FirstName || "Unknown"} ${doc.Creator?.LastName || "Unknown"}`,
        preview: latestFilepath || "",
        userRole: isCreator ? "creator" : "approver", // Track user's role
        department: doc.Department?.Name ?? "Unassigned"
      };
    });

    const total = docs.length;
    const inProcess = docs.filter((doc) => doc.status === "In Process").length;
    const completed = docs.filter((doc) => doc.status === "Completed").length;

    return NextResponse.json({
      docs,
      summary: {
        total,
        inProcess,
        completed,
      },
    });
  } catch (err) {
    console.error("Error fetching documents:", err);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}
