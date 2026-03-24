/**
 * Google Reviews Cron — Syncs reviews from Google Places API daily
 * Schedule: Daily at 6 AM (configured in vercel.json)
 */
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { syncGoogleReviews } from "@/lib/googleReviews";

function verifyCronAuth(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  if (token.length !== cronSecret.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(cronSecret));
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncGoogleReviews();
    return NextResponse.json({
      ok: true,
      synced: result.synced,
      averageRating: result.averageRating,
      totalReviews: result.totalReviews,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/google-reviews] Error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
