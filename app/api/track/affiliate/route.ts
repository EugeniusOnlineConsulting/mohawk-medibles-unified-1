/**
 * POST /api/track/affiliate — Track affiliate link clicks (public)
 * Called from middleware when ?ref= parameter is detected
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const { code, page } = await request.json();

        if (!code) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const affiliate = await prisma.affiliate.findUnique({
            where: { code },
        });

        if (!affiliate || affiliate.status !== "ACTIVE") {
            return NextResponse.json({ success: false });
        }

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const userAgent = request.headers.get("user-agent") || null;
        const referrer = request.headers.get("referer") || null;

        await Promise.all([
            prisma.affiliateClick.create({
                data: {
                    affiliateId: affiliate.id,
                    ip,
                    userAgent,
                    referrer,
                    page: page || null,
                },
            }),
            prisma.affiliate.update({
                where: { id: affiliate.id },
                data: { totalClicks: { increment: 1 } },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[track/affiliate] Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
