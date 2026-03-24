/**
 * POST /api/push/subscribe — Save push subscription for authenticated user
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
        const { endpoint, keys } = body;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json({ error: "Missing subscription data" }, { status: 400 });
        }

        // Upsert subscription (endpoint is unique)
        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                userId: payload.sub,
                p256dh: keys.p256dh,
                auth: keys.auth,
                updatedAt: new Date(),
            },
            create: {
                userId: payload.sub,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[push/subscribe] Error:", error.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
