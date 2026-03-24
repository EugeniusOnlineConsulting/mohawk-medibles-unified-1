/**
 * POST /api/admin/affiliates/reject — Reject an affiliate application
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const { applicationId, note } = await request.json();

        const updated = await prisma.affiliateApplication.update({
            where: { id: applicationId },
            data: {
                status: "REJECTED",
                adminNote: note || null,
            },
        });

        return NextResponse.json({ application: updated });
    } catch (error) {
        console.error("[affiliates/reject] Error:", error);
        return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
    }
}
