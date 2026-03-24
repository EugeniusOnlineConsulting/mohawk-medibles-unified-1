/**
 * POST /api/push/unsubscribe — Remove push subscription
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const cookieStore = await cookies();
        const token = cookieStore.get("mm-session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const payload = verifySessionToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        const body = await req.json();
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
        }

        // Delete subscription (only if it belongs to this user)
        await prisma.pushSubscription.deleteMany({
            where: {
                endpoint,
                userId: payload.sub,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[push/unsubscribe] Error:", error.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
