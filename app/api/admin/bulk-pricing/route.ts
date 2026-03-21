/**
 * Admin Bulk Pricing API
 * GET    /api/admin/bulk-pricing?productId=X — get tiers for a product
 * POST   /api/admin/bulk-pricing — set tiers for a product
 * DELETE /api/admin/bulk-pricing?productId=X — remove all tiers
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const productId = Number(req.nextUrl.searchParams.get("productId"));

        if (productId) {
            const tiers = await prisma.bulkPricingTier.findMany({
                where: { productId, isActive: true },
                orderBy: { minQuantity: "asc" },
            });
            return NextResponse.json({ tiers });
        }

        // Return products list for selector
        const products = await prisma.product.findMany({
            where: { status: "ACTIVE" },
            select: { id: true, name: true, price: true },
            orderBy: { name: "asc" },
            take: 200,
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error("Bulk pricing GET error:", error);
        return NextResponse.json({ tiers: [], products: [] });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { productId, tiers } = await req.json();

        if (!productId || !Array.isArray(tiers)) {
            return NextResponse.json({ error: "productId and tiers required" }, { status: 400 });
        }

        // Deactivate existing tiers
        await prisma.bulkPricingTier.updateMany({
            where: { productId },
            data: { isActive: false },
        });

        // Create new tiers
        for (const tier of tiers) {
            await prisma.bulkPricingTier.create({
                data: {
                    productId,
                    minQuantity: tier.minQuantity,
                    maxQuantity: tier.maxQuantity || null,
                    discountPercent: tier.discountPercent,
                    priceOverride: tier.priceOverride || null,
                    isActive: true,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Bulk pricing POST error:", error);
        return NextResponse.json({ error: "Failed to save bulk pricing" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const productId = Number(req.nextUrl.searchParams.get("productId"));
        if (!productId) {
            return NextResponse.json({ error: "productId required" }, { status: 400 });
        }

        await prisma.bulkPricingTier.updateMany({
            where: { productId },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Bulk pricing DELETE error:", error);
        return NextResponse.json({ error: "Failed to remove bulk pricing" }, { status: 500 });
    }
}
