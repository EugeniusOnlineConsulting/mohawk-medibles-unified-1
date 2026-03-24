/**
 * POST /api/admin/affiliates/update — Update affiliate (commission rate, status)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const { affiliateId, commissionRate, status } = await request.json();

        const data: Record<string, unknown> = {};
        if (commissionRate !== undefined) data.commissionRate = commissionRate;
        if (status !== undefined) data.status = status;

        const updated = await prisma.affiliate.update({
            where: { id: affiliateId },
            data,
        });

        return NextResponse.json({ affiliate: updated });
    } catch (error) {
        console.error("[affiliates/update] Error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
