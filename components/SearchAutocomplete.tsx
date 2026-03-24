"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Search, X, Loader2, ShoppingBag, FolderOpen, FileText,
    ArrowRight, Command, Leaf,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface ProductResult {
    id: number;
    name: string;
    shortName: string;
    category: string;
    price: number;
    image: string;
    slug: string;
    path: string;
    thc: string;
    cbd: string;
    score: number;
}

interface CategoryResult {
    name: string;
    slug: string;
}

interface BlogResult {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
}

interface SearchResponse {
    query: string;
    totalCount: number;
    products: ProductResult[];
    categories: CategoryResult[];
    blog: BlogResult[];
}

type ResultItem =
    | { type: "product"; data: ProductResult }
    | { type: "category"; data: CategoryResult }
    | { type: "blog"; data: BlogResult }
    | { type: "viewAll" };

// ─── Strain type helpers ────────────────────────────────────

function getStrainBadge(category: string, thc: string): { label: string; color: string } | null {
    // Only show strain type for flower-like categories
    const flowerCats = new Set(["flower", "pre-rolls", "hash"]);
    if (!flowerCats.has(category.toLowerCase())) return null;
    // Infer from THC if possible, otherwise skip
    return null;
}

function getCategoryBadgeColor(category: string): string {
    const map: Record<string, string> = {
        Flower: "bg-green-500/15 text-green-400",
        Edibles: "bg-orange-500/15 text-orange-400",
        Concentrates: "bg-amber-500/15 text-amber-400",
        Vapes: "bg-blue-500/15 text-blue-400",
        Hash: "bg-yellow-500/15 text-yellow-400",
        "Pre-Rolls": "bg-lime-500/15 text-lime-400",
        CBD: "bg-teal-500/15 text-teal-400",
        Capsules: "bg-purple-500/15 text-purple-400",
    };
    return map[category] || "bg-zinc-500/15 text-zinc-400";
}

// ─── Component ──────────────────────────────────────────────

export default function SearchAutocomplete() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // ─── Build flat list of navigable items ─────────────────

    const flatItems: ResultItem[] = [];
    if (results) {
        results.products.forEach((p) => flatItems.push({ type: "product", data: p }));
        results.categories.forEach((c) => flatItems.push({ type: "category", data: c }));
        results.blog.forEach((b) => flatItems.push({ type: "blog", data: b }));
        if (results.totalCount > 0) flatItems.push({ type: "viewAll" });
    }

    // ─── Debounced Search ───────────────────────────────────

    const performSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults(null);
            setLoading(false);
            return;
        }

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await fetch(
                `/api/search?q=${encodeURIComponent(q)}`,
                { signal: controller.signal }
            );
            if (res.ok) {
                const data: SearchResponse = await res.json();
                if (!controller.signal.aborted) {
                    setResults(data);
                }
            }
        } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
                setResults(null);
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, []);

    const handleInputChange = (value: string) => {
        setQuery(value);
        setSelectedIndex(-1);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) {
            setResults(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(() => performSearch(value), 300);
    };

    // ─── Navigation ─────────────────────────────────────────

    const navigateToItem = useCallback((item: ResultItem) => {
        switch (item.type) {
            case "product":
                router.push(`/product/${item.data.slug}`);
                break;
            case "category":
                router.push(`/shop?category=${item.data.slug}`);
                break;
            case "blog":
                router.push(`/blog/${item.data.slug}`);
                break;
            case "viewAll":
                router.push(`/shop?q=${encodeURIComponent(query)}`);
                break;
        }
        closeSearch();
    }, [router, query]);

    // ─── Keyboard Navigation ────────────────────────────────

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < flatItems.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && flatItems[selectedIndex]) {
                    navigateToItem(flatItems[selectedIndex]);
                } else if (query.length >= 2) {
                    router.push(`/shop?q=${encodeURIComponent(query)}`);
                    closeSearch();
                }
                break;
            case "Escape":
                closeSearch();
                break;
        }
    };

    const closeSearch = () => {
        setIsOpen(false);
        setIsMobileOpen(false);
        setQuery("");
        setResults(null);
        setSelectedIndex(-1);
        inputRef.current?.blur();
    };

    // ─── Click Outside ──────────────────────────────────────

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ─── Cmd+K shortcut ────────────────────────────────────

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // ─── Focus mobile input on open ────────────────────────

    useEffect(() => {
        if (isMobileOpen) {
            setTimeout(() => mobileInputRef.current?.focus(), 100);
        }
    }, [isMobileOpen]);

    // ─── Cleanup ────────────────────────────────────────────

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    // ─── Scroll selected into view ──────────────────────────

    useEffect(() => {
        if (selectedIndex >= 0) {
            const el = document.querySelector(`[data-search-index="${selectedIndex}"]`);
            el?.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex]);

    // ─── Result Dropdown Content (shared between desktop + mobile) ───

    const renderResults = () => {
        if (!results && !loading && query.length >= 2) {
            return (
                <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
                </div>
            );
        }

        if (!results) return null;
        if (results.totalCount === 0 && !loading) {
            return (
                <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
                </div>
            );
        }

        let flatIdx = 0;

        return (
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {/* Product Results */}
                {results.products.length > 0 && (
                    <div className="py-1.5">
                        <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            <ShoppingBag className="w-3 h-3" />
                            Products
                            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                        </div>
                        {results.products.map((product) => {
                            const idx = flatIdx++;
                            const isActive = idx === selectedIndex;
                            return (
                                <button
                                    key={`product-${product.id}`}
                                    data-search-index={idx}
                                    onClick={() => navigateToItem({ type: "product", data: product })}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                                        isActive
                                            ? "bg-green-500/10 dark:bg-green-500/10"
                                            : "hover:bg-foreground/5 dark:hover:bg-white/5"
                                    }`}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-white/5 flex-shrink-0 overflow-hidden relative">
                                        {product.image && product.image.startsWith("http") ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Leaf className="h-4 w-4 text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-foreground dark:text-white font-medium truncate">
                                            {product.shortName || product.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${getCategoryBadgeColor(product.category)}`}>
                                                {product.category}
                                            </span>
                                            {product.thc && product.thc !== "TBD" && (
                                                <span className="text-[10px] text-muted-foreground/70">
                                                    THC {product.thc}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Price */}
                                    <div className="text-sm font-bold text-emerald-500 dark:text-emerald-400 whitespace-nowrap">
                                        {product.price > 0 ? `$${product.price.toFixed(2)}` : "Quote"}
                                    </div>
                                    {isActive && (
                                        <ArrowRight className="w-3.5 h-3.5 text-green-500/60 shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Category Results */}
                {results.categories.length > 0 && (
                    <div className="py-1.5 border-t border-border/50">
                        <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            <FolderOpen className="w-3 h-3" />
                            Categories
                        </div>
                        {results.categories.map((cat) => {
                            const idx = flatIdx++;
                            const isActive = idx === selectedIndex;
                            return (
                                <button
                                    key={`cat-${cat.slug}`}
                                    data-search-index={idx}
                                    onClick={() => navigateToItem({ type: "category", data: cat })}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                                        isActive
                                            ? "bg-green-500/10 dark:bg-green-500/10"
                                            : "hover:bg-foreground/5 dark:hover:bg-white/5"
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-foreground/5 dark:bg-white/5 flex items-center justify-center">
                                        <FolderOpen className="w-4 h-4 text-muted-foreground/60" />
                                    </div>
                                    <span className="text-sm text-foreground dark:text-white font-medium">
                                        Shop {cat.name}
                                    </span>
                                    {isActive && (
                                        <ArrowRight className="w-3.5 h-3.5 text-green-500/60 shrink-0 ml-auto" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Blog Results */}
                {results.blog.length > 0 && (
                    <div className="py-1.5 border-t border-border/50">
                        <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            <FileText className="w-3 h-3" />
                            Articles
                        </div>
                        {results.blog.map((post) => {
                            const idx = flatIdx++;
                            const isActive = idx === selectedIndex;
                            return (
                                <button
                                    key={`blog-${post.id}`}
                                    data-search-index={idx}
                                    onClick={() => navigateToItem({ type: "blog", data: post })}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                                        isActive
                                            ? "bg-green-500/10 dark:bg-green-500/10"
                                            : "hover:bg-foreground/5 dark:hover:bg-white/5"
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-foreground/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                        {post.featuredImage ? (
                                            <Image
                                                src={post.featuredImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                                sizes="32px"
                                            />
                                        ) : (
                                            <FileText className="w-4 h-4 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-foreground dark:text-white font-medium truncate">
                                            {post.title}
                                        </div>
                                        {post.excerpt && (
                                            <div className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                                                {post.excerpt.slice(0, 60)}...
                                            </div>
                                        )}
                                    </div>
                                    {isActive && (
                                        <ArrowRight className="w-3.5 h-3.5 text-green-500/60 shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* View All Results */}
                {results.totalCount > 0 && (
                    <div className="border-t border-border/50">
                        {(() => {
                            const idx = flatIdx;
                            const isActive = idx === selectedIndex;
                            return (
                                <button
                                    data-search-index={idx}
                                    onClick={() => navigateToItem({ type: "viewAll" })}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full p-3 text-xs text-center font-bold uppercase tracking-wider transition-colors duration-100 ${
                                        isActive
                                            ? "bg-green-500/10 text-green-500"
                                            : "text-green-600 dark:text-green-400 hover:bg-foreground/5 dark:hover:bg-white/5"
                                    }`}
                                >
                                    View all results for &ldquo;{query}&rdquo;
                                </button>
                            );
                        })()}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* ─── Desktop Search ──────────────────────────────── */}
            <div ref={dropdownRef} className="relative hidden md:block">
                {/* Collapsed toggle */}
                {!isOpen && (
                    <button
                        onClick={() => {
                            setIsOpen(true);
                            setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="flex items-center gap-2 text-foreground/60 dark:text-white/70 hover:text-foreground dark:hover:text-white hover:bg-foreground/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg transition-colors"
                        aria-label="Open search"
                    >
                        <Search className="h-4 w-4" />
                        <span className="text-[10px] text-muted-foreground/50 hidden lg:inline">
                            Press <kbd className="px-1 py-0.5 rounded border border-border/50 bg-foreground/5 dark:bg-white/5 text-[9px] font-mono">/</kbd>
                        </span>
                    </button>
                )}

                {/* Expanded input */}
                {isOpen && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search products, categories, articles..."
                                className="w-56 lg:w-72 pl-8 pr-8 py-1.5 text-xs bg-foreground/5 dark:bg-white/10 border border-border rounded-lg text-foreground dark:text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                                aria-label="Search"
                                aria-expanded={!!results && results.totalCount > 0}
                                aria-controls="search-results-desktop"
                                aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
                                role="combobox"
                                autoComplete="off"
                            />
                            {loading ? (
                                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 animate-spin" />
                            ) : query ? (
                                <button
                                    onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground dark:hover:text-white/70"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            ) : null}
                        </div>
                        <button
                            onClick={closeSearch}
                            className="text-muted-foreground hover:text-foreground dark:hover:text-white text-xs"
                            aria-label="Close search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Desktop dropdown */}
                {isOpen && query.length >= 2 && (results || loading) && (
                    <div
                        id="search-results-desktop"
                        role="listbox"
                        className="absolute top-full right-0 mt-2 w-96 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-[80] animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        {loading && !results && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                            </div>
                        )}
                        {renderResults()}
                    </div>
                )}

                {/* No results */}
                {isOpen && query.length >= 2 && !loading && results && results.totalCount === 0 && (
                    <div
                        className="absolute top-full right-0 mt-2 w-96 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-[80] animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        {renderResults()}
                    </div>
                )}
            </div>

            {/* ─── Mobile Search Toggle ─────────────────────── */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden text-foreground/60 dark:text-white/70 hover:text-foreground dark:hover:text-white p-2 rounded-md transition-colors"
                aria-label="Open search"
            >
                <Search className="h-4 w-4" />
            </button>

            {/* ─── Mobile Full-Screen Overlay ───────────────── */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[9998] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                        <Search className="h-5 w-5 text-muted-foreground/60 shrink-0" />
                        <input
                            ref={mobileInputRef}
                            type="text"
                            value={query}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search products, categories, articles..."
                            className="flex-1 bg-transparent text-base text-foreground dark:text-white placeholder-muted-foreground/60 outline-none"
                            autoComplete="off"
                        />
                        {loading && <Loader2 className="h-4 w-4 text-muted-foreground/60 animate-spin shrink-0" />}
                        <button
                            onClick={closeSearch}
                            className="text-muted-foreground hover:text-foreground dark:hover:text-white p-1"
                            aria-label="Close search"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto">
                        {query.length < 2 ? (
                            <div className="p-8 text-center">
                                <Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Start typing to search products, categories, and articles
                                </p>
                            </div>
                        ) : loading && !results ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                            </div>
                        ) : (
                            renderResults()
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
