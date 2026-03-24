/**
 * GET /api/admin/affiliates/applications — List affiliate applications
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const applications = await prisma.affiliateApplication.findMany({
            include: { user: { select: { name: true, email: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        return NextResponse.json({ applications });
    } catch (error) {
        console.error("[affiliates/applications] Error:", error);
        return NextResponse.json({ applications: [] }, { status: 500 });
    }
}
