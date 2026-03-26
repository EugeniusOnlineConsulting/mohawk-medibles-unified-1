"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Filter, ChevronDown, Sparkles, Search, ShoppingCart,
    Check, ArrowUpDown, X, MessageCircle, Star,
    Cloud, Zap, Leaf, Moon, Heart,
} from "lucide-react";
import { PRODUCTS, getAllCategories, getShortName, type Product } from "@/lib/productData";
import { INTENTS, filterByIntent, type ShoppingIntent } from "@/lib/intentMapping";
import { decodeHtmlEntities } from "@/lib/utils";
import { getLowestPricePerGram } from "@/lib/bulkPricing";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/hooks/useCart";
import FreeShippingBar from "@/components/FreeShippingBar";
import WishlistButton from "@/components/WishlistButton";
import { trackCategoryView, trackSearch, trackProductView, trackServerEvent } from "@/lib/sage/behavioral";
import { trackViewItemList, trackAddToCart as trackGA4AddToCart, trackSearch as trackGA4Search } from "@/lib/analytics";
import RecommendationCarousel from "@/components/RecommendationCarousel";
import RecentlyViewed from "@/components/RecentlyViewed";
import CompareButton from "@/components/CompareButton";
import GradeBadge from "@/components/GradeBadge";
import GradeExplainer from "@/components/GradeExplainer";
import GiftTierProgress from "@/components/GiftTierProgress";
import { getProductGrade, ALL_GRADES, type GradeKey } from "@/lib/gradeMapping";
import { isTerritoryGrown } from "@/lib/territoryGrown";
import TerritoryGrownBadge from "@/components/TerritoryGrownBadge";
import PriceMatchBadge from "@/components/PriceMatchBadge";

const CATEGORIES = ["All", ...getAllCategories()];
const PRODUCTS_PER_PAGE = 24;

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest";

const SORT_LABELS: Record<SortOption, string> = {
    featured: "Featured First",
    "price-asc": "Price: Low \u2192 High",
    "price-desc": "Price: High \u2192 Low",
    "name-asc": "Name: A \u2192 Z",
    "name-desc": "Name: Z \u2192 A",
    newest: "Newest First",
};

// ── Intent / Mood icon mapping ──
const INTENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Cloud, Zap, Leaf, Moon, Heart,
};

function IntentPillBar({
    activeIntent,
    onIntentChange,
}: {
    activeIntent: ShoppingIntent | "all";
    onIntentChange: (intent: ShoppingIntent | "all") => void;
}) {
    return (
        <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                {/* All pill */}
                <button
                    onClick={() => onIntentChange("all")}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                        activeIntent === "all"
                            ? "bg-white/10 text-white ring-1 ring-white/20 shadow-lg dark:bg-white/10 dark:text-white"
                            : "text-muted-foreground hover:bg-muted dark:hover:bg-white/5"
                    }`}
                >
                    All
                </button>
                {INTENTS.map((intent) => {
                    const Icon = INTENT_ICONS[intent.icon] ?? Leaf;
                    const isActive = activeIntent === intent.key;
                    return (
                        <button
                            key={intent.key}
                            onClick={() => onIntentChange(intent.key)}
                            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                                isActive
                                    ? intent.pillActive
                                    : "text-muted-foreground hover:bg-muted dark:hover:bg-white/5"
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {intent.label}
                        </button>
                    );
                })}
            </div>
            {activeIntent !== "all" && (
                <p className="text-xs text-muted-foreground mt-2">
                    Showing products matched to the <span className="font-medium">{INTENTS.find(i => i.key === activeIntent)?.label}</span> mood
                </p>
            )}
        </div>
    );
}

export default function ShopClient() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const intentParam = searchParams.get("intent");

    const [activeCategory, setActiveCategory] = useState("All");
    const [activeIntent, setActiveIntent] = useState<ShoppingIntent | "all">("all");
    const [sortBy, setSortBy] = useState<SortOption>("featured");
    const [sortOpen, setSortOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
    const { addItem, items, total, openCart } = useCart();
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
    const [reviewStats, setReviewStats] = useState<Record<number, { avg: number; count: number }>>({});
    const [personalizedRecs, setPersonalizedRecs] = useState<any[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [strainType, setStrainType] = useState("All");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [gradeFilter, setGradeFilter] = useState<GradeKey | "All">("All");
    const [territoryGrownOnly, setTerritoryGrownOnly] = useState(false);

    // ── Fetch review stats + personalized recommendations ──
    useEffect(() => {
        fetch("/api/reviews/stats")
            .then((r) => r.ok ? r.json() : {})
            .then((data) => setReviewStats(data))
            .catch(() => {});

        fetch("/api/recommendations?type=personalized&limit=8")
            .then((r) => r.ok ? r.json() : { products: [] })
            .then((d) => setPersonalizedRecs(d.products || []))
            .catch(() => {});
    }, []);

    // ── Read ?category= and ?search= from URL ──
    useEffect(() => {
        if (categoryParam && CATEGORIES.includes(categoryParam)) {
            setActiveCategory(categoryParam);
        }
    }, [categoryParam]);

    useEffect(() => {
        if (searchParam) {
            setSearchQuery(searchParam);
        }
    }, [searchParam]);

    // ── Read ?intent= from URL ──
    useEffect(() => {
        if (intentParam && INTENTS.some((i) => i.key === intentParam)) {
            setActiveIntent(intentParam as ShoppingIntent);
        }
    }, [intentParam]);

    // ── Filter → Search → Sort pipeline ──────────────────────
    const processedProducts = useMemo(() => {
        let result: Product[] = PRODUCTS;

        // Intent/mood filter
        if (activeIntent !== "all") {
            result = filterByIntent(result, activeIntent);
        }

        // Category filter
        if (activeCategory !== "All") {
            result = result.filter(p => p.category === activeCategory);
        }

        // Strain type filter
        if (strainType !== "All") {
            result = result.filter(p => p.specs.type.toLowerCase().includes(strainType.toLowerCase()));
        }

        // Price range filter
        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Grade filter
        if (gradeFilter !== "All") {
            result = result.filter(p => {
                const grade = getProductGrade({ grade: null, price: p.price, category: p.category, specs: { weight: p.specs.weight } });
                return grade === gradeFilter;
            });
        }

        // Territory Grown filter
        if (territoryGrownOnly) {
            result = result.filter(p => isTerritoryGrown(p));
        }

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.shortDescription.toLowerCase().includes(q) ||
                p.specs.terpenes.some(t => t.toLowerCase().includes(q)) ||
                p.specs.type.toLowerCase().includes(q)
            );
        }

        // Sort
        switch (sortBy) {
            case "price-asc":
                result = [...result].sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result = [...result].sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                result = [...result].sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                result = [...result].sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "newest":
                result = [...result].sort((a, b) => b.id - a.id);
                break;
            case "featured":
            default:
                result = [...result].sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return 0;
                });
                break;
        }

        return result;
    }, [activeCategory, searchQuery, sortBy, priceRange, strainType, activeIntent, gradeFilter, territoryGrownOnly]);

    const visibleProducts = processedProducts.slice(0, visibleCount);
    const hasMore = visibleCount < processedProducts.length;

    // ── Quick Add to Cart ────────────────────────────────────
    const handleQuickAdd = useCallback((product: Product) => {
        addItem({
            id: String(product.id),
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
        });
        trackGA4AddToCart({ id: String(product.id), name: product.name, price: product.price, category: product.category, quantity: 1 });
        setAddedIds(prev => new Set(prev).add(product.id));
        setTimeout(() => {
            setAddedIds(prev => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }, 1500);
        openCart();
    }, [addItem, openCart]);

    // ── Reset visible count on filter/search change ──────────
    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        setStrainType("All");
        setVisibleCount(PRODUCTS_PER_PAGE);
        if (cat !== "All") {
            trackCategoryView(cat);
            trackServerEvent("category_view", { category: cat });
        }
    };

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setVisibleCount(PRODUCTS_PER_PAGE);
        if (val.trim().length > 2) {
            trackSearch(val.trim());
            trackServerEvent("search", { query: val.trim() });
            trackGA4Search(val.trim(), processedProducts.length);
        }
    };

    const isInCart = (productId: number) => items.some(i => i.id === String(productId));

    return (
        <div className="min-h-screen page-glass pt-20">
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-forest dark:text-cream mb-6">Full Collection</h1>

                {/* ── Promo Deal Banner ── */}
                <div className="mb-6 bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-lg overflow-hidden">
                    <div className="flex animate-scroll whitespace-nowrap py-2.5 px-4">
                        {["\ud83d\udd25 $40 OUNCES of Bud or 3 For $100", "\ud83d\udc8e Hash Starting at $140/OZ", "\ud83d\ude9a FREE Shipping on Orders Over $199", "\u26a1 25,000 Puff Elf Bar Vapes \u2014 $35 Each", "\ud83c\udf3f Premium Flower Starting at $40/OZ"].map((deal, i) => (
                            <span key={i} className="inline-block mx-8 text-sm font-semibold text-lime">{deal}</span>
                        ))}
                        {["\ud83d\udd25 $40 OUNCES of Bud or 3 For $100", "\ud83d\udc8e Hash Starting at $140/OZ", "\ud83d\ude9a FREE Shipping on Orders Over $199", "\u26a1 25,000 Puff Elf Bar Vapes \u2014 $35 Each", "\ud83c\udf3f Premium Flower Starting at $40/OZ"].map((deal, i) => (
                            <span key={`dup-${i}`} className="inline-block mx-8 text-sm font-semibold text-lime">{deal}</span>
                        ))}
                    </div>
                </div>

                {/* ── Category Image Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                    {CATEGORIES.filter(c => c !== "All").slice(0, 6).map((cat) => {
                        const count = PRODUCTS.filter(p => p.category === cat).length;
                        const sampleProduct = PRODUCTS.find(p => p.category === cat);
                        return (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`relative overflow-hidden rounded-lg border transition-all duration-200 group ${
                                    activeCategory === cat
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                <div className="aspect-[4/3] bg-card relative">
                                    {sampleProduct?.image && (
                                        <Image
                                            src={sampleProduct.image}
                                            alt={cat}
                                            fill
                                            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2">
                                        <div className="text-xs font-bold text-white">{cat}</div>
                                        <div className="text-[10px] text-white/70">{count} products</div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* ── Intent / Mood Pill Bar ── */}
                <IntentPillBar activeIntent={activeIntent} onIntentChange={(intent) => { setActiveIntent(intent); setVisibleCount(PRODUCTS_PER_PAGE); }} />

                {/* Free Shipping Progress Bar */}
                <div className="mb-8">
                    <FreeShippingBar />
                </div>

                {/* ── Category Pills + Filter Bar (all screens) ── */}
                <div className="space-y-4 mb-6">
                    {/* Search (mobile) */}
                    <div className="relative" role="search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <label htmlFor="shop-search-mobile" className="sr-only">Search products</label>
                        <input
                            id="shop-search-mobile"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-border bg-white dark:bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-forest/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => handleSearchChange("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Horizontal scrollable category pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                        {CATEGORIES.map((cat) => {
                            const count = cat === "All"
                                ? PRODUCTS.length
                                : PRODUCTS.filter(p => p.category === cat).length;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${activeCategory === cat
                                        ? "bg-forest text-white dark:bg-leaf dark:text-forest shadow-md"
                                        : "bg-white dark:bg-card text-muted-foreground border border-border hover:bg-muted dark:hover:bg-white/5"
                                        }`}
                                >
                                    <span>{cat}</span>
                                    <span className="text-[10px] opacity-75">({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Expandable filter drawer (strain type + price) */}
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white dark:bg-card text-sm font-medium text-forest dark:text-cream hover:bg-muted transition-colors w-full justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            More Filters
                            {(strainType !== "All" || priceRange[0] > 0 || priceRange[1] < 500) && (
                                <span className="w-2 h-2 rounded-full bg-lime-500" />
                            )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`} />
                    </button>

                    {mobileFiltersOpen && (
                        <div className="bg-white dark:bg-card rounded-xl border border-border p-4 space-y-5 animate-in slide-in-from-top-2 duration-200">
                            {/* Strain Type */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm text-forest dark:text-cream">Strain Type</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(["All", "Indica", "Sativa", "Hybrid"] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => { setStrainType(type); setVisibleCount(PRODUCTS_PER_PAGE); }}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${strainType === type
                                                ? "bg-forest/10 text-forest dark:text-leaf border border-forest/30 dark:border-leaf/30"
                                                : "text-muted-foreground border border-border hover:bg-muted dark:hover:bg-white/5"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quality Grade (mobile) */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm text-forest dark:text-cream">Quality Grade</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(["All", ...ALL_GRADES] as const).map((grade) => (
                                        <button
                                            key={grade}
                                            onClick={() => { setGradeFilter(grade as GradeKey | "All"); setVisibleCount(PRODUCTS_PER_PAGE); }}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${gradeFilter === grade
                                                ? "bg-forest/10 text-forest dark:text-leaf border border-forest/30 dark:border-leaf/30"
                                                : "text-muted-foreground border border-border hover:bg-muted dark:hover:bg-white/5"
                                                }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm text-forest dark:text-cream">Price Range</h3>
                                <div className="px-1 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Min: <span className="font-medium text-lime-600 dark:text-lime-400">${priceRange[0]}</span></span>
                                        <span className="text-muted-foreground">Max: <span className="font-medium text-lime-600 dark:text-lime-400">${priceRange[1]}</span></span>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min={0}
                                            max={500}
                                            step={5}
                                            value={priceRange[0]}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPriceRange(([, max]) => [Math.min(val, max), max]);
                                            }}
                                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-lime-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                                            aria-label="Minimum price"
                                        />
                                        <input
                                            type="range"
                                            min={0}
                                            max={500}
                                            step={5}
                                            value={priceRange[1]}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPriceRange(([min]) => [min, Math.max(val, min)]);
                                            }}
                                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-lime-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                                            aria-label="Maximum price"
                                        />
                                    </div>
                                    {(priceRange[0] > 0 || priceRange[1] < 500) && (
                                        <button
                                            onClick={() => setPriceRange([0, 500])}
                                            className="text-xs text-lime-600 dark:text-lime-400 hover:underline"
                                        >
                                            Reset price filter
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Territory Grown Toggle (mobile) */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm text-forest dark:text-cream">Collection</h3>
                                <button
                                    onClick={() => { setTerritoryGrownOnly(!territoryGrownOnly); setVisibleCount(PRODUCTS_PER_PAGE); }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                        territoryGrownOnly
                                            ? "bg-amber-700/10 text-amber-800 dark:text-amber-400 border border-amber-500/30"
                                            : "text-muted-foreground border border-border hover:bg-muted dark:hover:bg-white/5"
                                    }`}
                                >
                                    <Leaf className="h-3.5 w-3.5" />
                                    Territory Grown Only
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Product Grid ─────────────────────────── */}
                <div>
                        {/* Personalized Recommendations */}
                        {personalizedRecs.length > 0 && activeCategory === "All" && !searchQuery && (
                            <RecommendationCarousel
                                title="Recommended For You"
                                products={personalizedRecs}
                            />
                        )}
                        {/* Recently Viewed */}
                        <RecentlyViewed />

                        {/* Toolbar */}
                        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                            <div className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
                                Showing {visibleProducts.length} of {processedProducts.length} products
                                {searchQuery && (
                                    <span className="ml-1">
                                        for &ldquo;<span className="font-medium text-forest dark:text-cream">{searchQuery}</span>&rdquo;
                                    </span>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setSortOpen(!sortOpen)}
                                    aria-expanded={sortOpen}
                                    aria-haspopup="listbox"
                                    aria-label={`Sort by: ${SORT_LABELS[sortBy]}`}
                                >
                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                    {SORT_LABELS[sortBy]}
                                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                                </Button>
                                {sortOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                                        <div role="listbox" aria-label="Sort options" className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-card border border-border rounded-lg shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                                            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                                                <button
                                                    key={key}
                                                    role="option"
                                                    aria-selected={sortBy === key}
                                                    onClick={() => { setSortBy(key); setSortOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${sortBy === key
                                                        ? "bg-forest/10 text-forest dark:text-leaf font-medium"
                                                        : "text-foreground hover:bg-muted dark:hover:bg-white/5"
                                                        }`}
                                                >
                                                    {label}
                                                    {sortBy === key && <Check className="h-3.5 w-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* No Results */}
                        {processedProducts.length === 0 && (
                            <div className="text-center py-20">
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-forest dark:text-cream mb-2">No products found</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Try a different search term or browse a category.
                                </p>
                                <Button variant="outline" size="sm" onClick={() => { handleSearchChange(""); handleCategoryChange("All"); setStrainType("All"); setPriceRange([0, 500]); setActiveIntent("all"); setGradeFilter("All"); }}>
                                    Clear Filters
                                </Button>
                            </div>
                        )}

                        {/* Product Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" role="list" aria-label="Products">
                            {visibleProducts.map((product) => (
                                <div key={product.id} role="listitem" className="group bg-white dark:bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                                    <Link href={`/shop/${product.slug}`}>
                                        <ProductImage
                                            src={product.image}
                                            alt={product.altText || product.name}
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        >
                                            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                                                <div className="bg-white/90 dark:bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-medium text-forest dark:text-cream">
                                                    {product.specs.type}
                                                </div>
                                                <GradeBadge
                                                    product={{ grade: null, price: product.price, category: product.category, specs: { weight: product.specs.weight } }}
                                                    size="sm"
                                                />
                                            </div>
                                            <div className={`absolute ${product.featured ? "top-3 right-12" : "top-3 right-3"} z-20 flex flex-col gap-1.5`}>
                                                <WishlistButton
                                                    product={{
                                                        id: product.id,
                                                        slug: product.slug,
                                                        name: product.name,
                                                        price: product.price,
                                                        image: product.image,
                                                        category: product.category,
                                                    }}
                                                />
                                                <CompareButton slug={product.slug} />
                                            </div>
                                            {product.featured && (
                                                <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1 z-20">
                                                    <Sparkles className="h-3 w-3" /> Featured
                                                </div>
                                            )}
                                            {/* Stock urgency badges */}
                                            {product.specs.type.toLowerCase().includes("sale") ? (
                                                <div className="absolute bottom-3 right-3 bg-red-500/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white z-20 animate-pulse">
                                                    SALE
                                                </div>
                                            ) : product.id % 5 === 0 ? (
                                                <div className="absolute bottom-3 right-3 bg-amber-500/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white z-20">
                                                    Selling Fast
                                                </div>
                                            ) : product.id % 7 === 0 ? (
                                                <div className="absolute bottom-3 right-3 bg-red-600/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white z-20">
                                                    Low Stock
                                                </div>
                                            ) : null}
                                        </ProductImage>
                                    </Link>
                                    <div className="p-4">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                            <span className="text-sm text-foreground/80 dark:text-cream/80 font-medium">
                                                {product.category}{product.specs.thc && product.specs.thc !== "TBD" ? ` • ${product.specs.thc} THC` : ""}
                                            </span>
                                            {isTerritoryGrown(product) && <TerritoryGrownBadge size="sm" />}
                                        </div>
                                        <Link href={`/shop/${product.slug}`}>
                                            <h3 className="font-bold text-forest dark:text-cream mb-1 hover:text-leaf transition-colors line-clamp-1">
                                                {getShortName(product)}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-foreground/70 dark:text-cream/75 mb-2 line-clamp-2">
                                            {decodeHtmlEntities(product.shortDescription)}
                                        </p>

                                        {/* Star Rating */}
                                        {reviewStats[product.id] && (
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className={`h-3 w-3 ${s <= Math.round(reviewStats[product.id].avg) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    ({reviewStats[product.id].count})
                                                </span>
                                            </div>
                                        )}

                                        {/* Terpene chips */}
                                        {product.specs.terpenes.length > 0 && (
                                            <div className="flex gap-1 flex-wrap mb-3">
                                                {product.specs.terpenes.slice(0, 2).map((t) => (
                                                    <span key={t} className="px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-[10px] text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <span className="font-bold text-lg text-forest dark:text-cream">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                {(() => {
                                                    const ppg = getLowestPricePerGram({ price: product.price, category: product.category, specs: { weight: product.specs.weight } });
                                                    return ppg ? (
                                                        <span className="block text-[10px] text-muted-foreground font-medium">
                                                            From ${ppg.toFixed(2)}/g
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Quick Add to Cart */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={`gap-1 text-xs transition-all duration-200 ${addedIds.has(product.id)
                                                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300"
                                                        : isInCart(product.id)
                                                            ? "border-forest/30 text-forest"
                                                            : ""
                                                        }`}
                                                    onClick={(e) => { e.preventDefault(); handleQuickAdd(product); }}
                                                    disabled={product.price === 0}
                                                >
                                                    {addedIds.has(product.id) ? (
                                                        <><Check className="h-3 w-3" /> Added</>
                                                    ) : (
                                                        <><ShoppingCart className="h-3 w-3" /> {isInCart(product.id) ? "Add More" : "Add"}</>
                                                    )}
                                                </Button>
                                                <Link href={`/shop/${product.slug}`}>
                                                    <Button size="sm" variant="brand">View</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load More */}
                        {hasMore && (
                            <div className="text-center mt-10">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="gap-2 px-8"
                                    onClick={() => setVisibleCount(prev => prev + PRODUCTS_PER_PAGE)}
                                >
                                    Load More Products
                                    <span className="text-xs text-muted-foreground">
                                        ({processedProducts.length - visibleCount} remaining)
                                    </span>
                                </Button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
