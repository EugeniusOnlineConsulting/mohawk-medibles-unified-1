/**
 * GET /api/admin/affiliates/payouts — List all payout requests
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const payouts = await prisma.affiliatePayout.findMany({
            include: {
                affiliate: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        return NextResponse.json({ payouts });
    } catch (error) {
        console.error("[affiliates/payouts] Error:", error);
        return NextResponse.json({ payouts: [] }, { status: 500 });
    }
}
