        import { db } from "@/lib/db";
        import { NextResponse } from "next/server";

        export async function GET() {
        try {
            const types = await db.documentType.findMany({
            where: { IsDeleted: false },
            select: {
                TypeID: true,
                TypeName: true,
            },
            });

            return NextResponse.json(types);
        } catch (error) {
            console.error("❌ Failed to fetch document types:", error);
            return NextResponse.json({ message: "Failed to fetch document types." }, { status: 500 });
        }
        }