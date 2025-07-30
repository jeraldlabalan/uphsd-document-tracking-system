import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      UserID: number;
      Role: string;
    };

    const creatorID = decoded.UserID;

    const {
      Title,
      Description,
      Type,
      FilePath,
      FileType,
      DepartmentID,
      ApproverIDs, // array of UserIDs
    } = await req.json();

    // 1. Create the main document
    const newDocument = await db.document.create({
      data: {
        Title,
        Description,
        DocumentType: Type, // Add this line to include the required DocumentType property
        Department: DepartmentID
          ? { connect: { DepartmentID } }
          : undefined,
        Creator: { connect: { UserID: creatorID } },
        CreatedAt: new Date(),
      },
    });

    // 2. Create initial document version
    await db.documentVersion.create({
      data: {
        Document: { connect: { DocumentID: newDocument.DocumentID } },
        VersionNumber: 1,
        FilePath,
        ChangeDescription: "Initial version",
        User: { connect: { UserID: creatorID } },
      },
    });

    // 3. Create document requests + notifications for each approver
    const status = await db.status.findFirst({
      where: { StatusName: "Pending" },
    });

    if (!status) {
      return NextResponse.json({ error: "Missing 'Pending' status in DB" }, { status: 500 });
    }

    const notifications = ApproverIDs.map((approverID: number) =>
      db.notification.create({
        data: {
          UserID: approverID,
          Message: `A new document "${Title}" requires your review.`,
          CreatedAt: new Date(),
        },
      })
    );

    const documentRequests = ApproverIDs.map((approverID: number) =>
      db.documentRequest.create({
        data: {
          UserID: approverID,
          DocumentID: newDocument.DocumentID,
          StatusID: status.StatusID,
          Remarks: "Awaiting review",
        },
      })
    );

    await Promise.all([...notifications, ...documentRequests]);

    return NextResponse.json({
      message: "Document successfully created",
      documentID: newDocument.DocumentID,
    });
  } catch (error: any) {
    console.error("Document creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
