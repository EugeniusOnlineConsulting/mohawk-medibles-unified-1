/**
 * GET /api/admin/affiliates/list — List all affiliates
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const affiliates = await prisma.affiliate.findMany({
            include: {
                user: { select: { name: true, email: true, avatar: true } },
                _count: { select: { conversions: true, clicks: true, payouts: true } },
            },
            orderBy: { totalEarnings: "desc" },
            take: 100,
        });
        return NextResponse.json({ affiliates });
    } catch (error) {
        console.error("[affiliates/list] Error:", error);
        return NextResponse.json({ affiliates: [] }, { status: 500 });
    }
}
