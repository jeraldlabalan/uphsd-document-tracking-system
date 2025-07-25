// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { writeFile } from "fs/promises";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";

// // Needed for file upload parsing
// import formidable from "formidable";
// import { connect } from "http2";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(req: Request) {
//   try {
//     // Parse the incoming form data
//     const form = formidable({ multiples: false });

//     const data = await new Promise<{ fields: any; files: any }>(
//       (resolve, reject) => {
//         form.parse(req as any, (err, fields, files) => {
//           if (err) reject(err);
//           resolve({ fields, files });
//         });
//       }
//     );

//     const { fields, files } = data;

//     // Simulated user ID for now
//     const userId = 1;

//     // Save uploaded file
//     let filePath = null;
//     if (files.file) {
//       const file = files.file[0];
//       const fileExt = path.extname(file.originalFilename);
//       const newFileName = `${uuidv4()}${fileExt}`;
//       const newPath = path.join(process.cwd(), "public/uploads", newFileName);
//       await writeFile(newPath, await file.toBuffer());
//       filePath = `/uploads/${newFileName}`;
//     }

//     // Create the document and request in a transaction
//     const created = await db.$transaction(async (prisma) => {
//       const doc = await prisma.document.create({
//         data: {
//           Title: fields.documentName,
//           Type: fields.classification,
//           Description: fields.description,
//           Department: {
//             connect: {
//               Name: fields.department,
//             },
//           },
//           CreatedBy: userId,
//           Status: "Active",
//           Versions: filePath
//             ? {
//                 create: {
//                   VersionNumber: 1,
//                   ChangedBy: userId,
//                   FilePath: filePath,
//                   ChangeDescription: "Initial upload",
//                 },
//               }
//             : undefined,
//         },
//       });

//       await prisma.documentRequest.create({
//         data: {
//           UserID: userId,
//           DocumentID: doc.DocumentID,
//           Status: {
//             connect: {
//               StatusName: "Pending",
//             },
//           },
//           Remarks: fields.notes,
//           Priority: "Normal",
//         },
//       });

//       // Insert approvers (pseudo — you might use your ESignature model)
//       if (fields.approvers) {
//         const approverIds = JSON.parse(fields.approvers);
//         for (const approverId of approverIds) {
//           await prisma.eSignature.create({
//             data: {
//               RequestID: doc.DocumentID,
//               SignedBy: approverId,
//               SignatureData: "",
//             },
//           });
//         }
//       }

//       return doc;
//     });

//     return NextResponse.json({ success: true, created });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
//   }
// }
