/**
 * Flash Sales API — Get active flash sales
 * Ported from Ian's .cc flash sale system
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/trpc/trpc";

// GET — List active flash sales with products
export async function GET() {
  try {
    const now = new Date();

    const flashSales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                price: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { endTime: "asc" },
    });

    return NextResponse.json({
      sales: flashSales,
      count: flashSales.length,
    });
  } catch (error) {
    console.error("[Flash Sales] Error:", error);
    return NextResponse.json({ error: "Failed to fetch flash sales" }, { status: 500 });
  }
}

// POST — Create flash sale (admin only)
export async function POST(req: NextRequest) {
  const userRole = req.headers.get("x-user-role");
  if (!userRole || !["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, discountType, discountValue, startTime, endTime, bannerColor, bannerText, productIds } = body;

    if (!name || !startTime || !endTime || !discountValue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const flashSale = await prisma.flashSale.create({
      data: {
        name,
        description,
        discountType: discountType || "percentage",
        discountValue,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        bannerColor,
        bannerText,
      },
    });

    // Add products to flash sale
    if (productIds && Array.isArray(productIds)) {
      for (const productId of productIds) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { price: true },
        });

        if (product) {
          const salePrice =
            discountType === "percentage"
              ? product.price * (1 - discountValue / 100)
              : product.price - discountValue;

          await prisma.flashSaleProduct.create({
            data: {
              flashSaleId: flashSale.id,
              productId,
              originalPrice: product.price,
              salePrice: Math.max(0, salePrice),
            },
          });
        }
      }
    }

    return NextResponse.json({ flashSale }, { status: 201 });
  } catch (error) {
    console.error("[Flash Sales] Create error:", error);
    return NextResponse.json({ error: "Failed to create flash sale" }, { status: 500 });
  }
}
