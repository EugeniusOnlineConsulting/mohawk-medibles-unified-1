/**
 * Bulk Review Stats API — Mohawk Medibles
 * GET /api/reviews/stats — Returns average rating + count for all products with reviews
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const rawStats = await prisma.review.groupBy({
            by: ["productId"],
            where: { status: "APPROVED" },
            _avg: { rating: true },
            _count: { rating: true },
        });

        const stats: Record<number, { avg: number; count: number }> = {};
        for (const s of rawStats) {
            stats[s.productId] = {
                avg: +(s._avg.rating || 0).toFixed(1),
                count: s._count.rating,
            };
        }

        return NextResponse.json(stats, {
            headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
        });
    } catch {
        return NextResponse.json({});
    }
}
