"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductImage from "@/components/ProductImage";
import WishlistButton from "@/components/WishlistButton";
import { useCart } from "@/hooks/useCart";

interface RecommendedProduct {
    id: number;
    slug: string;
    name: string;
    category: string;
    price: number;
    image: string;
    altText?: string;
    specs: {
        thc: string;
        type: string;
        terpenes: string[];
    };
    effects: string[];
    featured: boolean;
}

interface Props {
    title: string;
    products: RecommendedProduct[];
    loading?: boolean;
}

export default function RecommendationCarousel({ title, products, loading }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { addItem } = useCart();

    function scroll(dir: "left" | "right") {
        if (!scrollRef.current) return;
        const amount = 280;
        scrollRef.current.scrollBy({
            left: dir === "left" ? -amount : amount,
            behavior: "smooth",
        });
    }

    function handleQuickAdd(p: RecommendedProduct) {
        addItem({ id: String(p.id), name: p.name, price: p.price, quantity: 1, image: p.image });
    }

    if (loading) {
        return (
            <div className="mb-12">
                <h2 className="text-xl font-bold text-forest dark:text-cream mb-4">{title}</h2>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-[250px] flex-shrink-0 bg-white dark:bg-card rounded-xl border border-border animate-pulse">
                            <div className="aspect-square bg-muted rounded-t-xl" />
                            <div className="p-4 space-y-2">
                                <div className="h-3 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-forest dark:text-cream">{title}</h2>
                <div className="flex gap-1">
                    <button
                        onClick={() => scroll("left")}
                        className="p-2 rounded-lg bg-white dark:bg-card border border-border hover:bg-muted transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="p-2 rounded-lg bg-white dark:bg-card border border-border hover:bg-muted transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {products.map((p) => (
                    <div
                        key={p.id}
                        className="w-[250px] flex-shrink-0 snap-start bg-white dark:bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                        <Link href={`/shop/${p.slug}`}>
                            <div className="relative">
                                <ProductImage
                                    src={p.image}
                                    alt={p.altText || p.name}
                                    sizes="250px"
                                />
                                <div className="absolute top-2 right-2 z-20">
                                    <WishlistButton
                                        product={{
                                            id: p.id,
                                            slug: p.slug,
                                            name: p.name,
                                            price: p.price,
                                            image: p.image,
                                            category: p.category,
                                        }}
                                    />
                                </div>
                            </div>
                        </Link>
                        <div className="p-3">
                            <div className="text-xs text-muted-foreground mb-1">
                                {p.category} {p.specs.thc !== "TBD" && `• ${p.specs.thc} THC`}
                            </div>
                            <Link href={`/shop/${p.slug}`}>
                                <h3 className="font-semibold text-sm text-forest dark:text-cream line-clamp-2 hover:text-leaf transition-colors mb-2">
                                    {p.name}
                                </h3>
                            </Link>
                            {p.specs.terpenes.length > 0 && (
                                <div className="flex gap-1 flex-wrap mb-2">
                                    {p.specs.terpenes.slice(0, 2).map((t) => (
                                        <span key={t} className="px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-[9px] text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-forest dark:text-cream">
                                    ${p.price.toFixed(2)}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-xs h-7"
                                    onClick={(e) => { e.preventDefault(); handleQuickAdd(p); }}
                                >
                                    <ShoppingCart className="h-3 w-3" /> Add
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
