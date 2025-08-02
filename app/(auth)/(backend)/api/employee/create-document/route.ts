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
      TypeID,
      FilePath,
      DepartmentID,
      ApproverIDs, // array of UserIDs
    } = await req.json();

    // Step 1: Create the document
    const newDocument = await db.document.create({
      data: {
        Title,
        Description,
        TypeID : 1, // for testing only
        // FilePath,
        CreatedBy: creatorID,
        DepartmentID: DepartmentID || null,
      },
    });

    // Step 2: Create initial version
    await db.documentVersion.create({
      data: {
        DocumentID: newDocument.DocumentID,
        VersionNumber: 1,
        FilePath,
        ChangedBy: creatorID,
        ChangeDescription: "Initial version",
      },
    });

    // Step 3: Find 'Pending' status
    const pendingStatus = await db.status.findFirst({
      where: { StatusName: "In-Process" },
    });

    if (!pendingStatus) {
      return NextResponse.json(
        { error: "Missing 'Pending' status in DB" },
        { status: 500 }
      );
    }

    // Step 4: Create document requests and notifications

    
    const requests = ApproverIDs.map((approverID: number) =>
      db.documentRequest.create({
        data: {
          RequestedByID: creatorID,
          RecipientUserID: 1, // for testing only shoubeld be approverID
          DocumentID: newDocument.DocumentID,
          StatusID: pendingStatus.StatusID,
          Priority: "Normal",
          Remarks: "Awaiting review",
        },
      })
    );

    const notifs = ApproverIDs.map((approverID: number) =>
      db.notification.create({
        data: {
          SenderID: creatorID,
          ReceiverID: 1, // for testing only should be approverID
          Title: "New Document for Review",
          Message: `A new document "${Title}" requires your review.`,
        },
      })
    );

    await Promise.all([...requests, ...notifs]);

    return NextResponse.json({
      message: "Document successfully created",
      documentID: newDocument.DocumentID,
    });
  } catch (error) {
    console.error("Document creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
