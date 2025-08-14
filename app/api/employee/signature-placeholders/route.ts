import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// GET: Retrieve signature placeholders for a document
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as any;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ message: "Document ID is required" }, { status: 400 });
    }

    const placeholders = await db.signaturePlaceholder.findMany({
      where: {
        DocumentID: parseInt(documentId),
        IsDeleted: false,
      },
      include: {
        AssignedTo: {
          select: {
            UserID: true,
            FirstName: true,
            LastName: true,
            Email: true,
          },
        },
      },
    });

    return NextResponse.json({ placeholders });
  } catch (error) {
    console.error("Error fetching signature placeholders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create new signature placeholders
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as any;
    const body = await request.json();
    const { documentId, placeholders } = body;

    if (!documentId || !placeholders || !Array.isArray(placeholders)) {
      return NextResponse.json(
        { message: "Document ID and placeholders array are required" },
        { status: 400 }
      );
    }

    // Verify the user is the document creator
    const document = await db.document.findFirst({
      where: {
        DocumentID: parseInt(documentId),
        CreatedBy: decoded.UserID,
        IsDeleted: false,
      },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found or access denied" },
        { status: 403 }
      );
    }

    // Create all placeholders
    const createdPlaceholders = await Promise.all(
      placeholders.map(async (placeholder: any) => {
        return await db.signaturePlaceholder.create({
          data: {
            DocumentID: parseInt(documentId),
            Page: placeholder.page,
            X: placeholder.x,
            Y: placeholder.y,
            Width: placeholder.width,
            Height: placeholder.height,
            AssignedToID: placeholder.assignedToId || parseInt(placeholder.signee),
          },
          include: {
            AssignedTo: {
              select: {
                UserID: true,
                FirstName: true,
                LastName: true,
                Email: true,
              },
            },
          },
        });
      })
    );

    // Create notifications for assigned signees
    await Promise.all(
      createdPlaceholders.map(async (placeholder) => {
        await db.notification.create({
          data: {
            Title: "Document Signature Required",
            Message: `You have been assigned to sign a document: ${document.Title}`,
            ReceiverID: placeholder.AssignedToID,
            SenderID: decoded.UserID,
          },
        });
      })
    );

    return NextResponse.json({
      message: "Signature placeholders created successfully",
      placeholders: createdPlaceholders,
    });
  } catch (error) {
    console.error("Error creating signature placeholders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update signature placeholder (e.g., mark as signed)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as any;
    const body = await request.json();
    const { placeholderId, signatureData } = body;

    if (!placeholderId || !signatureData) {
      return NextResponse.json(
        { message: "Placeholder ID and signature data are required" },
        { status: 400 }
      );
    }

    // Verify the user is assigned to this placeholder
    const placeholder = await db.signaturePlaceholder.findFirst({
      where: {
        PlaceholderID: parseInt(placeholderId),
        AssignedToID: decoded.UserID,
        IsDeleted: false,
      },
    });

    if (!placeholder) {
      return NextResponse.json(
        { message: "Placeholder not found or access denied" },
        { status: 403 }
      );
    }

    // Update the placeholder with signature data
    console.log("Updating placeholder with data:", {
      placeholderId,
      isSigned: true,
      signedAt: new Date(),
      signatureData: signatureData,
      isDeleted: body.isDeleted || false,
    });
    
    const updatedPlaceholder = await db.signaturePlaceholder.update({
      where: { PlaceholderID: parseInt(placeholderId) },
      data: {
        IsSigned: true,
        SignedAt: new Date(),
        SignatureData: signatureData,
        IsDeleted: body.isDeleted || false, // Handle isDeleted field
      },
      include: {
        AssignedTo: {
          select: {
            UserID: true,
            FirstName: true,
            LastName: true,
            Email: true,
          },
        },
      },
    });
    
    console.log("Placeholder updated successfully:", updatedPlaceholder);

    return NextResponse.json({
      message: "Signature applied successfully",
      placeholder: updatedPlaceholder,
    });
  } catch (error) {
    console.error("Error updating signature placeholder:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove signature placeholder
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as any;
    const { searchParams } = new URL(request.url);
    const placeholderId = searchParams.get("placeholderId");

    if (!placeholderId) {
      return NextResponse.json(
        { message: "Placeholder ID is required" },
        { status: 400 }
      );
    }

    // Verify the user is the document creator
    const placeholder = await db.signaturePlaceholder.findFirst({
      where: {
        PlaceholderID: parseInt(placeholderId),
        IsDeleted: false,
      },
      include: {
        Document: true,
      },
    });

    if (!placeholder || placeholder.Document.CreatedBy !== decoded.UserID) {
      return NextResponse.json(
        { message: "Placeholder not found or access denied" },
        { status: 403 }
      );
    }

    // Soft delete the placeholder
    await db.signaturePlaceholder.update({
      where: { PlaceholderID: parseInt(placeholderId) },
      data: { IsDeleted: true },
    });

    return NextResponse.json({
      message: "Signature placeholder removed successfully",
    });
  } catch (error) {
    console.error("Error deleting signature placeholder:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
