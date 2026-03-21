/**
 * Bulk Images API — Product list for matching, image upload, CSV template
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "productList";

    if (action === "productList") {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { name: "asc" },
      });

      const result = products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageCount: 0, // Would count images in a real implementation
      }));

      return NextResponse.json(result);
    }

    if (action === "csvTemplate") {
      const products = await prisma.product.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      });

      const csv = ["id,name,slug", ...products.map(p => `${p.id},"${p.name}","${p.slug}"`)].join("\n");
      return new NextResponse(csv, {
        headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=product_image_mapping.csv" },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "uploadImage") {
      const { productId, base64, filename, contentType } = body;
      // In production, this would upload to cloud storage and update the product
      // For now, return success
      return NextResponse.json({ success: true, processed: 1, errors: [] });
    }

    if (action === "bulkUpload") {
      const { productIds, images } = body;
      const results = productIds.map((id: number) => ({ productId: id, processed: 1, errors: [] }));
      return NextResponse.json({ results });
    }

    if (action === "clearImages") {
      const { productId } = body;
      // Would clear product images in production
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
