"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingCart, Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import type { ResolvedBundle } from "./page";

// Badge color mapping
const BADGE_STYLES: Record<string, string> = {
    POPULAR: "bg-forest/80 dark:bg-lime/80 text-white dark:text-black",
    "BEST VALUE": "bg-forest/80 dark:bg-lime/80 text-white dark:text-black",
    NEW: "bg-blue-600/80 text-white",
    PREMIUM: "bg-amber-500/80 text-black",
};

// Gradient color cycling for visual variety
const CARD_ACCENTS = [
    "border-forest/30 dark:border-lime/30",
    "border-purple-500/30",
    "border-amber-500/30",
    "border-pink-500/30",
    "border-cyan-500/30",
    "border-indigo-500/30",
];

function getBadgeLabel(name: string): string | null {
    const lower = name.toLowerCase();
    if (lower.includes("starter")) return "POPULAR";
    if (lower.includes("sampler") || lower.includes("edible")) return "BEST VALUE";
    if (lower.includes("party")) return "NEW";
    if (lower.includes("premium") || lower.includes("experience")) return "PREMIUM";
    return null;
}

interface BundlesClientProps {
    bundles: ResolvedBundle[];
}

export default function BundlesClient({ bundles }: BundlesClientProps) {
    const { addItem } = useCart();
    const [addedBundleIds, setAddedBundleIds] = useState<Set<number>>(new Set());
    const [expandedBundleIds, setExpandedBundleIds] = useState<Set<number>>(new Set());

    const handleAddBundle = useCallback(
        (bundle: ResolvedBundle) => {
            // Add each product in the bundle to the cart
            for (const product of bundle.products) {
                addItem({
                    id: String(product.id),
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                    image: product.image,
                });
            }

            // Show confirmation state
            setAddedBundleIds((prev) => {
                const next = new Set(prev);
                next.add(bundle.id);
                return next;
            });

            setTimeout(() => {
                setAddedBundleIds((prev) => {
                    const next = new Set(prev);
                    next.delete(bundle.id);
                    return next;
                });
            }, 2000);
        },
        [addItem]
    );

    const toggleExpanded = useCallback((bundleId: number) => {
        setExpandedBundleIds((prev) => {
            const next = new Set(prev);
            if (next.has(bundleId)) {
                next.delete(bundleId);
            } else {
                next.add(bundleId);
            }
            return next;
        });
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-forest dark:text-lime text-xs font-bold uppercase tracking-wider mb-6">
                        <Package className="w-3.5 h-3.5" />
                        Save More With Bundles
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-6">
                        Cannabis Bundles
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4">
                        Save up to 25% with our curated product bundles. Each bundle is hand-picked from
                        our catalog for quality, variety, and value. All products meet our Empire Standard&trade;.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {bundles.length} bundle{bundles.length !== 1 ? "s" : ""} available
                    </p>
                </div>
            </section>

            {/* Bundles Grid */}
            <section className="container mx-auto px-6 mb-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bundles.map((bundle, index) => {
                        const badge = getBadgeLabel(bundle.name);
                        const isAdded = addedBundleIds.has(bundle.id);
                        const isExpanded = expandedBundleIds.has(bundle.id);
                        const accentClass = CARD_ACCENTS[index % CARD_ACCENTS.length];

                        return (
                            <div
                                key={bundle.id}
                                className={`relative glass-card rounded-2xl border ${accentClass} backdrop-blur-md flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-forest/5 dark:hover:shadow-lime/5`}
                            >
                                {/* Badge */}
                                {badge && (
                                    <div
                                        className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${BADGE_STYLES[badge] || BADGE_STYLES.POPULAR}`}
                                    >
                                        {badge}
                                    </div>
                                )}

                                {/* Bundle hero image (first product) */}
                                {bundle.products[0]?.image && (
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <Image
                                            src={bundle.products[0].image}
                                            alt={bundle.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                                        {/* Savings badge overlay */}
                                        <div className="absolute bottom-4 left-4 bg-forest/90 dark:bg-lime/90 text-white dark:text-black text-sm font-bold px-3 py-1.5 rounded-lg">
                                            Save ${bundle.savingsAmount.toFixed(0)} ({bundle.savingsPercent}% off)
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-2xl font-bold text-foreground uppercase tracking-wide mb-2">
                                        {bundle.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                        {bundle.description}
                                    </p>

                                    {/* Product list (collapsible) */}
                                    <div className="mb-5 flex-1">
                                        <button
                                            onClick={() => toggleExpanded(bundle.id)}
                                            className="flex items-center gap-2 text-xs font-bold text-forest dark:text-lime uppercase tracking-wider mb-3 hover:opacity-80 transition-opacity"
                                        >
                                            {bundle.products.length} item{bundle.products.length !== 1 ? "s" : ""} included
                                            {isExpanded ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                            ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            )}
                                        </button>

                                        <div
                                            className={`space-y-2 transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                                        >
                                            {bundle.products.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/shop/${product.slug}`}
                                                    className="flex items-center gap-3 group"
                                                >
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            sizes="40px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-foreground truncate group-hover:text-forest dark:group-hover:text-lime transition-colors">
                                                            {product.quantity > 1
                                                                ? `${product.quantity}x `
                                                                : ""}
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {product.category} &middot; ${product.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="flex items-baseline gap-3 mb-5">
                                        <span className="text-3xl font-bold text-forest dark:text-lime">
                                            ${bundle.bundlePrice.toFixed(0)}
                                        </span>
                                        <span className="text-muted-foreground line-through text-sm">
                                            ${bundle.regularPrice.toFixed(0)}
                                        </span>
                                    </div>

                                    {/* Add to Cart */}
                                    <Button
                                        variant="brand"
                                        size="lg"
                                        className="w-full"
                                        onClick={() => handleAddBundle(bundle)}
                                        disabled={isAdded}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Added to Cart
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Add Bundle to Cart
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Build Your Own CTA */}
            <section className="container mx-auto px-6 text-center">
                <div className="glass-card p-12 rounded-2xl border border-secondary/20 backdrop-blur-md max-w-2xl mx-auto">
                    <Sparkles className="w-8 h-8 text-forest dark:text-lime mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-foreground mb-4 uppercase">
                        Build Your Own Bundle
                    </h2>
                    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                        Can&apos;t find the perfect bundle? Browse our full shop and mix &amp; match
                        products with bulk pricing for automatic discounts on larger orders.
                    </p>
                    <Link href="/shop">
                        <Button variant="brand" size="lg">
                            Browse All Products
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
