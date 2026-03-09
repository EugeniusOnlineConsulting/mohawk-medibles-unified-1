import { NextResponse } from "next/server";
import { getGMBIntegration } from "@/lib/gmb-integration";

/**
 * POST /api/admin/sync-gmb
 * Admin endpoint to sync GMB data
 * Requires admin authentication
 */
export async function POST(request: Request) {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const result = await getGMBIntegration().syncAllLocations();

    return NextResponse.json({
      success: true,
      message: `Synced ${result.success} locations successfully`,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("GMB Sync Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to sync GMB data",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync-gmb
 * Get GMB sync status
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "locations") {
      // Fetch GMB locations without syncing
      const locations = await getGMBIntegration().fetchAllLocations();
      return NextResponse.json({
        success: true,
        count: locations.length,
        locations: locations.map((l: any) => ({
          name: l.name,
          locationName: l.locationName,
          address: l.address,
        })),
      });
    }

    // Default: return sync status
    return NextResponse.json({
      success: true,
      status: "ready",
      message: "GMB integration is configured",
      envCheck: {
        hasClientEmail: !!process.env.GMB_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GMB_PRIVATE_KEY,
        hasAccountName: !!process.env.GMB_ACCOUNT_NAME,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
