/**
 * POST /api/admin/push/send — Admin: Send push notification to all or specific users
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { broadcastPush, sendPushToUser } from "@/lib/webpush";
import { cookies } from "next/headers";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export async function POST(req: NextRequest) {
    try {
        // Admin auth check
        const cookieStore = await cookies();
        const token = cookieStore.get("mm-session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const payload = verifySessionToken(token);
        if (!payload || !ADMIN_ROLES.includes(payload.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await req.json();
        const { title, body: msgBody, url, userId } = body;

        if (!title || !msgBody) {
            return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
        }

        if (userId) {
            // Send to specific user
            const count = await sendPushToUser(userId, title, msgBody, url);
            return NextResponse.json({ success: true, sent: count });
        } else {
            // Broadcast to all
            const result = await broadcastPush(title, msgBody, url);
            return NextResponse.json({ success: true, ...result });
        }
    } catch (error: any) {
        console.error("[admin/push/send] Error:", error.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
