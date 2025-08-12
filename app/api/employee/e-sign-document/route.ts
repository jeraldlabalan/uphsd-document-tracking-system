import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
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

    const signerID = decoded.UserID;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentId = formData.get('documentId') as string;
    const documentTitle = formData.get('documentTitle') as string;
    
    if (!file || !documentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `e-signed-${timestamp}-${file.name}`;
    
    // Save to documents directory
    const documentsDir = join(process.cwd(), 'public', 'uploads', 'documents');
    const filepath = join(documentsDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Update database with new version
    const documentID = parseInt(documentId);
    
    // Get current version number
    const currentVersion = await db.documentVersion.findFirst({
      where: { DocumentID: documentID },
      orderBy: { VersionNumber: 'desc' }
    });
    
    const newVersionNumber = currentVersion ? currentVersion.VersionNumber + 1 : 1;
    
    // Create new document version
    const newVersion = await db.documentVersion.create({
      data: {
        DocumentID: documentID,
        VersionNumber: newVersionNumber,
        FilePath: `/uploads/documents/${filename}`, // Remove /public prefix
        ChangedBy: signerID,
        ChangeDescription: `E-signed version by user ${signerID}`,
      },
    });

    // Update signature placeholders to mark them as signed
    await db.signaturePlaceholder.updateMany({
      where: { 
        DocumentID: documentID,
        AssignedToID: signerID,
        IsSigned: false
      },
      data: {
        IsSigned: true,
        SignedAt: new Date(),
      },
    });

    // Check if all placeholders are signed
    const allPlaceholders = await db.signaturePlaceholder.findMany({
      where: { DocumentID: documentID },
    });

    const allSigned = allPlaceholders.every(p => p.IsSigned);

    if (allSigned) {
      // All signatures complete - notify document creator
      const document = await db.document.findUnique({
        where: { DocumentID: documentID },
        include: { Creator: true },
      });

      if (document) {
        await db.notification.create({
          data: {
            Title: "Document Fully Signed",
            Message: `All signatures have been completed for document "${documentTitle}". The document is now ready for final processing.`,
            ReceiverID: document.CreatedBy,
            SenderID: signerID,
          },
        });

        // Update document status to "Awaiting-Completion"
        await db.document.update({
          where: { DocumentID: documentID },
          data: {
            Status: "Awaiting-Completion",
            UpdatedAt: new Date(),
          },
        });

        // Update all document requests to "Awaiting-Completion" status
        const awaitingCompletionStatus = await db.status.findFirst({
          where: { StatusName: "Awaiting-Completion" },
        });

        if (awaitingCompletionStatus) {
          await db.documentRequest.updateMany({
            where: { DocumentID: documentID },
            data: { StatusID: awaitingCompletionStatus.StatusID },
          });
        }
      }
    } else {
      // Find next unsigned placeholder and notify that signee
      const nextPlaceholder = allPlaceholders.find(p => !p.IsSigned);
      if (nextPlaceholder && nextPlaceholder.AssignedToID) {
        await db.notification.create({
          data: {
            Title: "Document Ready for Your Signature",
            Message: `A document "${documentTitle}" is ready for your signature. Please review and sign the document.`,
            ReceiverID: nextPlaceholder.AssignedToID,
            SenderID: signerID,
          },
        });
      }
    }

    // Create activity log
    await db.activityLog.create({
      data: {
        PerformedBy: signerID,
        Action: "E-Signed Document",
        TargetType: "Document",
        Remarks: `Document "${documentTitle}" e-signed and new version created`,
        TargetID: documentID,
      },
    });
    
    const fileUrl = `/uploads/documents/${filename}`;
    
    return NextResponse.json({
      success: true,
      message: 'E-signed document uploaded successfully',
      fileUrl: fileUrl,
      filename: filename,
      versionNumber: newVersionNumber
    });
    
  } catch (error) {
    console.error('Error uploading e-signed document:', error);
    return NextResponse.json(
      { error: 'Failed to upload e-signed document' },
      { status: 500 }
    );
  }
}
