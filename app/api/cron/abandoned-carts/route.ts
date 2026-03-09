/**
 * Abandoned Cart Cron — /api/cron/abandoned-carts
 * ═════════════════════════════════════════════════
 * Vercel Cron job that scans for abandoned carts and sends
 * reminder emails at 6h and 24h intervals.
 *
 * Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAbandonedCarts, markReminderSent } from "@/lib/abandonedCart";
import { sendAbandonedCartReminder } from "@/lib/email";
import { log } from "@/lib/logger";

const SIX_HOURS = 6 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let sent6h = 0;
    let sent24h = 0;
    const errors: string[] = [];

    // Stage 1: 6-hour reminders
    const carts6h = getAbandonedCarts(SIX_HOURS, "6h");
    for (const cart of carts6h) {
        if (!cart.email) continue;
        try {
            await sendAbandonedCartReminder(cart.email, {
                customerName: cart.email.split("@")[0],
                items: cart.items.map((i) => ({ name: i.name, price: i.price })),
                cartTotal: cart.total,
            });
            markReminderSent(cart.id, "6h");
            sent6h++;
        } catch (err) {
            errors.push(`6h:${cart.id}:${err instanceof Error ? err.message : "unknown"}`);
        }
    }

    // Stage 2: 24-hour reminders
    const carts24h = getAbandonedCarts(TWENTY_FOUR_HOURS, "24h");
    for (const cart of carts24h) {
        if (!cart.email) continue;
        try {
            await sendAbandonedCartReminder(cart.email, {
                customerName: cart.email.split("@")[0],
                items: cart.items.map((i) => ({ name: i.name, price: i.price })),
                cartTotal: cart.total,
            });
            markReminderSent(cart.id, "24h");
            sent24h++;
        } catch (err) {
            errors.push(`24h:${cart.id}:${err instanceof Error ? err.message : "unknown"}`);
        }
    }

    log.admin.info("Abandoned cart cron completed", {
        eligible6h: carts6h.length,
        sent6h,
        eligible24h: carts24h.length,
        sent24h,
        errors: errors.length,
    });

    return NextResponse.json({
        success: true,
        sent6h,
        sent24h,
        errors: errors.length,
        timestamp: new Date().toISOString(),
    });
}
