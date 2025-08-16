import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    const userID = decoded.UserID;

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Check if user has permission to undo signatures for this document
    const document = await db.document.findUnique({
      where: { DocumentID: parseInt(documentId) },
      include: { Creator: true }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // User can undo if they are the document creator or if they have signed the document
    const hasSignedPlaceholder = await db.signaturePlaceholder.findFirst({
      where: {
        DocumentID: parseInt(documentId),
        AssignedToID: userID,
        IsSigned: true
      }
    });
    
    const canUndo = document.CreatedBy === userID || hasSignedPlaceholder;

    if (!canUndo) {
      return NextResponse.json(
        { error: 'You do not have permission to undo signatures for this document' },
        { status: 403 }
      );
    }

    // Get count of placeholders that will be updated
    const signedPlaceholdersCount = await db.signaturePlaceholder.count({
      where: { 
        DocumentID: parseInt(documentId),
        IsSigned: true
      },
    });

    console.log(`Undoing ${signedPlaceholdersCount} signatures for document ${documentId}`);

    // Update all signature placeholders for this document to set isSigned = false
    const updateResult = await db.signaturePlaceholder.updateMany({
      where: { 
        DocumentID: parseInt(documentId),
        IsSigned: true
      },
      data: {
        IsSigned: false,
        SignedAt: null,
        SignatureData: null,
        // Fix: Ensure IsDeleted is set to false so placeholders can be re-signed
        IsDeleted: false,
      },
    });

    console.log(`Updated ${updateResult.count} signature placeholders`);

    // Get the latest document version to revert to
    const latestVersion = await db.documentVersion.findFirst({
      where: { DocumentID: parseInt(documentId) },
      orderBy: { VersionNumber: 'desc' }
    });

    // If there are multiple versions, remove the latest signed version
    if (latestVersion && latestVersion.VersionNumber > 1) {
      await db.documentVersion.delete({
        where: { VersionID: latestVersion.VersionID }
      });
    }

    // Update document status back to "In-Process" if it was completed
    if (document.Status === "Awaiting-Completion") {
      await db.document.update({
        where: { DocumentID: parseInt(documentId) },
        data: {
          Status: "In-Process",
          UpdatedAt: new Date(),
        },
      });
    }

    // Create activity log
    await db.activityLog.create({
      data: {
        PerformedBy: userID,
        Action: "Undo Signatures",
        TargetType: "Document",
        Remarks: `Signatures undone for document "${document.Title}". Document reverted to unsigned state.`,
        TargetID: parseInt(documentId),
      },
    });

    // Get updated placeholders
    const updatedPlaceholders = await db.signaturePlaceholder.findMany({
      where: { DocumentID: parseInt(documentId) },
      include: {
        AssignedTo: {
          select: {
            FirstName: true,
            LastName: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Signatures undone successfully',
      placeholders: updatedPlaceholders
    });
    
  } catch (error) {
    console.error('Error undoing signatures:', error);
    return NextResponse.json(
      { error: 'Failed to undo signatures' },
      { status: 500 }
    );
  }
}
