"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Package, X, Check, ShoppingCart, Leaf, ArrowRight,
    Sparkles, ChevronDown, Search,
} from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/productData";
import {
    BUNDLE_CONFIGS, type BundleConfig, type BundleSelection,
    calculateBundlePrice, validateBundle, isEligibleProduct,
    generateBundleCartId, generateBundleName,
} from "@/lib/mixAndMatch";
import { useCart } from "@/hooks/useCart";

// ─── Helpers ────────────────────────────────────────────────

function formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
}

function getStrainType(product: Product): string {
    const t = product.specs?.type || "";
    if (["Indica", "Sativa", "Hybrid"].includes(t)) return t;
    return "Hybrid";
}

function getStrainBadgeColor(type: string): string {
    switch (type) {
        case "Indica":
            return "bg-purple-500/15 text-purple-400 border-purple-500/20";
        case "Sativa":
            return "bg-amber-500/15 text-amber-400 border-amber-500/20";
        case "Hybrid":
        default:
            return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    }
}

// ─── Eligible flower products ───────────────────────────────

const FLOWER_PRODUCTS = PRODUCTS.filter((p) => isEligibleProduct(p.category)).sort(
    (a, b) => a.name.localeCompare(b.name)
);

// ─── Component ──────────────────────────────────────────────

export default function MixMatchClient() {
    const { addItem } = useCart();

    // State
    const [selectedBundle, setSelectedBundle] = useState<BundleConfig | null>(null);
    const [selections, setSelections] = useState<(BundleSelection | null)[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("All");
    const [addedToCart, setAddedToCart] = useState(false);

    // Derived
    const filledSelections = useMemo(
        () => selections.filter(Boolean) as BundleSelection[],
        [selections]
    );
    const priceResult = useMemo(
        () =>
            selectedBundle
                ? calculateBundlePrice(filledSelections, selectedBundle)
                : null,
        [filledSelections, selectedBundle]
    );
    const validationResult = useMemo(
        () =>
            selectedBundle
                ? validateBundle(filledSelections, selectedBundle)
                : { valid: false, error: "No bundle selected" },
        [filledSelections, selectedBundle]
    );

    // Filter products
    const filteredProducts = useMemo(() => {
        let products = FLOWER_PRODUCTS;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            products = products.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.specs?.type || "").toLowerCase().includes(q) ||
                    (p.subcategory || "").toLowerCase().includes(q)
            );
        }
        if (filterType !== "All") {
            products = products.filter((p) => getStrainType(p) === filterType);
        }
        return products;
    }, [searchQuery, filterType]);

    // Already selected product IDs (for visual feedback)
    const selectedProductIds = useMemo(
        () => new Set(filledSelections.map((s) => s.productId)),
        [filledSelections]
    );

    // ─── Actions ────────────────────────────────────────────

    const selectBundle = useCallback((config: BundleConfig) => {
        setSelectedBundle(config);
        setSelections(Array(config.slots).fill(null));
        setAddedToCart(false);
    }, []);

    const addToSlot = useCallback(
        (product: Product) => {
            if (!selectedBundle) return;
            setSelections((prev) => {
                const next = [...prev];
                // Find first empty slot
                const emptyIndex = next.findIndex((s) => s === null);
                if (emptyIndex === -1) return prev; // all slots full
                next[emptyIndex] = {
                    slotIndex: emptyIndex,
                    productId: product.id,
                    productSlug: product.slug,
                    productName: product.name,
                    productImage: product.image,
                    productPrice: product.price,
                    strainType: getStrainType(product),
                };
                return next;
            });
            setAddedToCart(false);
        },
        [selectedBundle]
    );

    const removeFromSlot = useCallback((slotIndex: number) => {
        setSelections((prev) => {
            const next = [...prev];
            next[slotIndex] = null;
            return next;
        });
        setAddedToCart(false);
    }, []);

    const addBundleToCart = useCallback(() => {
        if (!selectedBundle || !priceResult || !validationResult.valid) return;
        const cartId = generateBundleCartId(selectedBundle, filledSelections);
        const cartName = generateBundleName(selectedBundle, filledSelections);
        // Use the first product's image as the bundle image
        const bundleImage = filledSelections[0]?.productImage || "";
        addItem({
            id: cartId,
            name: cartName,
            price: priceResult.finalPrice,
            quantity: 1,
            image: bundleImage,
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
    }, [selectedBundle, priceResult, validationResult, filledSelections, addItem]);

    const emptySlotCount = selections.filter((s) => s === null).length;

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Hero */}
            <section className="container mx-auto px-6 mb-12">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6">
                        <Sparkles className="w-4 h-4" />
                        Custom Ounces
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground uppercase mb-4">
                        Build Your Own Ounce
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Mix your favorite strains and save! Choose your bundle size,
                        pick your strains, and enjoy bulk pricing on premium flower.
                    </p>
                </div>
            </section>

            {/* Step 1: Choose Bundle Size */}
            <section className="container mx-auto px-6 mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm">
                        1
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight uppercase">
                        Choose Your Bundle
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {BUNDLE_CONFIGS.map((config) => {
                        const isSelected = selectedBundle?.id === config.id;
                        return (
                            <button
                                key={config.id}
                                onClick={() => selectBundle(config)}
                                className={`relative rounded-2xl p-6 text-left transition-all duration-300 group ${
                                    isSelected
                                        ? "bg-green-500/10 border-2 border-green-500/50 shadow-lg shadow-green-500/10"
                                        : "bg-card border-2 border-border hover:border-green-500/30 hover:shadow-md"
                                }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-3 right-3">
                                        <Check className="w-5 h-5 text-green-400" />
                                    </div>
                                )}
                                <div className="text-3xl mb-3">{config.icon}</div>
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    {config.label}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {config.description}
                                </p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                    <span className="text-green-400 font-bold text-sm">
                                        Save {config.discountPercent}%
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Step 2: Pick Strains (only shows after bundle selection) */}
            {selectedBundle && (
                <>
                    {/* Selected Slots */}
                    <section className="container mx-auto px-6 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm">
                                2
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight uppercase">
                                Pick Your Strains
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                ({filledSelections.length}/{selectedBundle.slots} selected)
                            </span>
                        </div>

                        {/* Slot cards */}
                        <div className={`grid gap-3 mb-6 ${
                            selectedBundle.slots === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                        }`}>
                            {selections.map((sel, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-xl p-4 transition-all duration-200 ${
                                        sel
                                            ? "bg-card border border-green-500/20"
                                            : "bg-card/50 border-2 border-dashed border-border"
                                    }`}
                                >
                                    {sel ? (
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                {sel.productImage && sel.productImage.startsWith("http") ? (
                                                    <Image
                                                        src={sel.productImage}
                                                        alt={sel.productName}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                                                        <Leaf className="w-6 h-6 text-muted-foreground/40" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                                                {sel.productName}
                                            </p>
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStrainBadgeColor(
                                                    sel.strainType
                                                )}`}
                                            >
                                                {sel.strainType}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                {formatPrice(sel.productPrice)} | {selectedBundle.weightPerSlot}g
                                            </p>
                                            <button
                                                onClick={() => removeFromSlot(idx)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                aria-label={`Remove ${sel.productName}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center py-4 gap-2">
                                            <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
                                                <Package className="w-5 h-5 text-muted-foreground/40" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Slot {idx + 1} — {selectedBundle.weightPerSlot}g
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Running total */}
                        {priceResult && filledSelections.length > 0 && (
                            <div className="rounded-xl bg-card border border-border p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground line-through">
                                                {formatPrice(priceResult.originalTotal)}
                                            </span>
                                            <span className="text-2xl font-bold text-foreground">
                                                {formatPrice(priceResult.finalPrice)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-green-400 font-semibold">
                                            You save {formatPrice(priceResult.savings)} ({priceResult.discountPercent}% off)
                                        </p>
                                        {filledSelections.length < selectedBundle.slots && (
                                            <p className="text-xs text-muted-foreground">
                                                {emptySlotCount} more strain{emptySlotCount > 1 ? "s" : ""} to go
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={addBundleToCart}
                                        disabled={!validationResult.valid}
                                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                                            validationResult.valid
                                                ? addedToCart
                                                    ? "bg-green-600 text-white shadow-lg"
                                                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        }`}
                                    >
                                        {addedToCart ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Added to Cart!
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4" />
                                                Add Bundle to Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Product Grid */}
                    <section className="container mx-auto px-6 mb-16">
                        {/* Search + Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search strains..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                                />
                            </div>
                            <div className="flex gap-2">
                                {["All", "Indica", "Sativa", "Hybrid"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                            filterType === type
                                                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                                                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No strains match your search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {filteredProducts.map((product) => {
                                    const strainType = getStrainType(product);
                                    const isSelected = selectedProductIds.has(product.id);
                                    const slotsFull = emptySlotCount === 0;
                                    const disabled = isSelected || slotsFull;

                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => !disabled && addToSlot(product)}
                                            disabled={disabled}
                                            className={`group rounded-xl p-3 text-left transition-all duration-200 ${
                                                isSelected
                                                    ? "bg-green-500/10 border-2 border-green-500/30 opacity-70"
                                                    : slotsFull
                                                    ? "bg-card border border-border opacity-50 cursor-not-allowed"
                                                    : "bg-card border border-border hover:border-green-500/30 hover:shadow-md cursor-pointer"
                                            }`}
                                        >
                                            {/* Image */}
                                            <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
                                                {product.image && product.image.startsWith("http") ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.altText || product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                                                        <Leaf className="w-8 h-8 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                        <Check className="w-6 h-6 text-green-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight mb-1.5">
                                                {product.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span
                                                    className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${getStrainBadgeColor(
                                                        strainType
                                                    )}`}
                                                >
                                                    {strainType}
                                                </span>
                                                {product.specs?.thc && product.specs.thc !== "TBD" && (
                                                    <span className="text-[9px] text-muted-foreground">
                                                        THC {product.specs.thc}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-foreground">
                                                {formatPrice(product.price)}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* No bundle selected prompt */}
            {!selectedBundle && (
                <section className="container mx-auto px-6 mb-16">
                    <div className="text-center py-12 rounded-2xl bg-card border border-border">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                            <ArrowRight className="w-8 h-8 text-green-400/50 -rotate-90" />
                        </div>
                        <p className="text-lg text-muted-foreground mb-2">
                            Select a bundle size above to start building your custom ounce
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                            {FLOWER_PRODUCTS.length} premium flower strains available to mix and match
                        </p>
                    </div>
                </section>
            )}

            {/* Bottom CTA */}
            <section className="container mx-auto px-6">
                <div className="text-center">
                    <Link
                        href="/shop?category=Flower"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Browse all flower products
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
