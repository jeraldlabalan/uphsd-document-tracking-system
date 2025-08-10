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

    const creatorID = decoded.UserID;

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
    const filename = `with-placeholders-${timestamp}-${file.name}`;
    
    // Save to uploads/documents directory (not public/documents to avoid duplication)
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
        ChangedBy: creatorID,
        ChangeDescription: `Document saved with signature placeholders`,
      },
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        PerformedBy: creatorID,
        Action: "Saved Document with Placeholders",
        TargetType: "Document",
        Remarks: `Document "${documentTitle}" saved with signature placeholders`,
        TargetID: documentID,
      },
    });

    // Create notifications for assigned signees
    const placeholdersWithSignees = await db.signaturePlaceholder.findMany({
      where: { DocumentID: documentID },
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

    // Create notifications for each assigned signee
    await Promise.all(
      placeholdersWithSignees.map(async (placeholder) => {
        if (placeholder.AssignedToID) {
          await db.notification.create({
            data: {
              Title: "Document Ready for Signature",
              Message: `A document "${documentTitle}" is ready for your signature. Please review and sign the document.`,
              ReceiverID: placeholder.AssignedToID,
              SenderID: creatorID,
            },
          });
        }
      })
    );
    
    const fileUrl = `/uploads/documents/${filename}`;
    
    return NextResponse.json({
      success: true,
      message: 'Document with placeholders saved successfully',
      fileUrl: fileUrl,
      filename: filename,
      versionNumber: newVersionNumber
    });
    
  } catch (error) {
    console.error('Error saving document with placeholders:', error);
    return NextResponse.json(
      { error: 'Failed to save document with placeholders' },
      { status: 500 }
    );
  }
}
