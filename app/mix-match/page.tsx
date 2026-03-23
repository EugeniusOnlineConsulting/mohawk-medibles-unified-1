import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Package, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Mix & Match Bulk Pricing — Save More, Buy More",
    description:
        "Mix and match cannabis products for bulk savings at Mohawk Medibles. The more you buy, the bigger the discount. Indigenous-owned dispensary shipping Canada-wide.",
    keywords: [
        "mix and match cannabis",
        "bulk cannabis canada",
        "cannabis bulk pricing",
        "weed bulk deals",
        "mohawk medibles bulk",
        "mix match weed canada",
        "cannabis quantity discount",
        "dispensary bulk savings",
    ],
    openGraph: {
        title: "Mix & Match Bulk Pricing",
        description:
            "Buy more, save more with our bulk pricing deals on premium cannabis products.",
        url: "https://mohawkmedibles.ca/mix-match",
        type: "website",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/mix-match",
    },
};

function formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
}

export default async function MixMatchPage() {
    // Get all active bulk pricing tiers
    const tiers = await prisma.bulkPricingTier.findMany({
        where: { isActive: true },
        orderBy: { minQuantity: "asc" },
    });

    const productIds = [...new Set(tiers.map((t) => t.productId))];

    // Fetch products that have bulk tiers
    const bulkProducts =
        productIds.length > 0
            ? await prisma.product.findMany({
                  where: {
                      id: { in: productIds },
                      status: "ACTIVE",
                  },
                  include: {
                      images: { orderBy: { position: "asc" }, take: 1 },
                      reviews: {
                          where: { status: "APPROVED" },
                          select: { rating: true },
                      },
                  },
              })
            : [];

    // Group tiers by product
    const tiersByProduct = new Map<number, typeof tiers>();
    for (const tier of tiers) {
        const existing = tiersByProduct.get(tier.productId) || [];
        existing.push(tier);
        tiersByProduct.set(tier.productId, existing);
    }

    // Build products with tiers and ratings
    const productsWithTiers = bulkProducts
        .filter((p) => tiersByProduct.has(p.id))
        .map((p) => {
            const reviewCount = p.reviews.length;
            const avgRating =
                reviewCount > 0
                    ? Math.round(
                          (p.reviews.reduce((sum, r) => sum + r.rating, 0) /
                              reviewCount) *
                              10
                      ) / 10
                    : 0;
            return {
                ...p,
                tiers: tiersByProduct.get(p.id)!,
                avgRating,
                reviewCount,
            };
        });

    const steps = [
        {
            num: "1",
            title: "Choose Products",
            desc: "Browse our mix & match eligible products",
        },
        {
            num: "2",
            title: "Buy in Bulk",
            desc: "The more you buy, the bigger the discount",
        },
        {
            num: "3",
            title: "Save Big",
            desc: "Enjoy automatic bulk pricing at checkout",
        },
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6">
                        <Package className="w-4 h-4" />
                        Bulk Savings
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-6">
                        Mix & Match
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        Buy more, save more with our bulk pricing deals.
                        Indigenous-owned. Empire Standard&trade; quality.
                    </p>
                </div>
            </section>

            {/* How It Works */}
            <section className="container mx-auto px-6 mb-16">
                <div className="rounded-2xl bg-card border border-border p-8 md:p-10">
                    <h2 className="text-2xl font-bold text-foreground mb-8 text-center tracking-tight uppercase">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {steps.map((step, i) => (
                            <div key={i} className="relative">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold text-xl">
                                    {step.num}
                                </div>
                                <p className="font-semibold text-foreground mb-1">
                                    {step.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {step.desc}
                                </p>
                                {i < 2 && (
                                    <ArrowRight className="hidden md:block absolute top-7 -right-4 w-6 h-6 text-muted-foreground/30" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products */}
            <section className="container mx-auto px-6">
                {productsWithTiers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Package className="w-10 h-10 text-green-400/50" />
                        </div>
                        <p className="text-xl text-muted-foreground mb-6">
                            No mix & match deals available right now.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors"
                        >
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {productsWithTiers.map((product) => {
                            const imgUrl =
                                product.images[0]?.url || product.image;
                            const maxDiscount = Math.max(
                                ...product.tiers.map((t) => t.discountPercent)
                            );
                            return (
                                <div
                                    key={product.id}
                                    className="group rounded-2xl bg-card border border-border hover:border-green-500/30 transition-all duration-300 p-6 md:p-8"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        {/* Product Image */}
                                        <Link
                                            href={`/product/${product.slug}`}
                                            className="shrink-0 relative"
                                        >
                                            {imgUrl ? (
                                                <Image
                                                    src={imgUrl}
                                                    alt={
                                                        product.altText ||
                                                        product.name
                                                    }
                                                    width={140}
                                                    height={140}
                                                    className="rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="w-[140px] h-[140px] bg-muted/30 rounded-xl" />
                                            )}
                                            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                                Up to {maxDiscount}%
                                            </span>
                                        </Link>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/product/${product.slug}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                <h3 className="text-lg font-bold text-foreground tracking-tight">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                            {product.category && (
                                                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                                                    {product.category}
                                                </p>
                                            )}

                                            {/* Star Rating */}
                                            {product.reviewCount > 0 && (
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <svg
                                                                    key={star}
                                                                    className={`w-3.5 h-3.5 ${
                                                                        star <=
                                                                        Math.round(
                                                                            product.avgRating
                                                                        )
                                                                            ? "text-yellow-400"
                                                                            : "text-muted-foreground/20"
                                                                    }`}
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            )
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {product.avgRating} (
                                                        {product.reviewCount})
                                                    </span>
                                                </div>
                                            )}

                                            <p className="text-sm text-muted-foreground mb-4">
                                                Base price:{" "}
                                                <span className="text-foreground font-bold">
                                                    {formatPrice(product.price)}
                                                </span>
                                            </p>

                                            {/* Tier Badges */}
                                            <div className="flex flex-wrap gap-2">
                                                {product.tiers.map(
                                                    (tier, i) => {
                                                        const discountedPrice =
                                                            product.price *
                                                            (1 -
                                                                tier.discountPercent /
                                                                    100);
                                                        return (
                                                            <div
                                                                key={i}
                                                                className="bg-green-500/5 border border-green-500/15 rounded-xl px-4 py-2.5 text-center"
                                                            >
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        tier.minQuantity
                                                                    }
                                                                    {tier.maxQuantity
                                                                        ? `-${tier.maxQuantity}`
                                                                        : "+"}{" "}
                                                                    units
                                                                </p>
                                                                <p className="text-green-400 font-bold text-sm">
                                                                    {
                                                                        tier.discountPercent
                                                                    }
                                                                    % OFF
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    {formatPrice(
                                                                        discountedPrice
                                                                    )}
                                                                    /ea
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            href={`/product/${product.slug}`}
                                            className="shrink-0 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-full hover:bg-primary/90 transition-colors hidden md:block"
                                        >
                                            View Product
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
