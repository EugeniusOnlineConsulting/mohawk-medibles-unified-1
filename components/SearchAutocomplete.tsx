"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";

interface SearchResult {
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

export default function SearchAutocomplete() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // ─── Debounced Search ──────────────────────────────────────
    const performSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        // Abort previous request
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await fetch(
                `/api/products/search?q=${encodeURIComponent(q)}&limit=6`,
                { signal: controller.signal }
            );
            if (res.ok) {
                const data = await res.json();
                setResults(data.results || []);
            }
        } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
                setResults([]);
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
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(() => performSearch(value), 300);
    };

    // ─── Keyboard Navigation ──────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    navigateToProduct(results[selectedIndex]);
                } else if (query.length >= 2) {
                    // Navigate to shop page with search query
                    router.push(`/shop?q=${encodeURIComponent(query)}`);
                    closeSearch();
                }
                break;
            case "Escape":
                closeSearch();
                break;
        }
    };

    const navigateToProduct = (result: SearchResult) => {
        router.push(`/shop/${result.slug}`);
        closeSearch();
    };

    const closeSearch = () => {
        setIsOpen(false);
        setQuery("");
        setResults([]);
        setSelectedIndex(-1);
        inputRef.current?.blur();
    };

    // ─── Click Outside ──────────────────────────────────────────
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

    // ─── Cleanup ────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Search Toggle Button (collapsed state) */}
            {!isOpen && (
                <button
                    onClick={() => {
                        setIsOpen(true);
                        setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="text-cream/70 hover:text-white hover:bg-white/5 p-2 rounded-md transition-colors"
                    aria-label="Open search"
                >
                    <Search className="h-4 w-4" />
                </button>
            )}

            {/* Search Input (expanded state) */}
            {isOpen && (
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cream/40" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search products..."
                            className="w-48 lg:w-64 pl-8 pr-8 py-1.5 text-xs bg-white/10 border border-white/15 rounded-lg text-white placeholder-cream/40 focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                            aria-label="Search products"
                            aria-expanded={results.length > 0}
                            aria-controls="search-results"
                            aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
                            role="combobox"
                            autoComplete="off"
                        />
                        {loading ? (
                            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cream/40 animate-spin" />
                        ) : query ? (
                            <button
                                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/70"
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        ) : null}
                    </div>
                    <button
                        onClick={closeSearch}
                        className="text-cream/50 hover:text-cream/80 text-xs"
                        aria-label="Close search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Results Dropdown */}
            {isOpen && query.length >= 2 && (results.length > 0 || (!loading && query.length >= 2)) && (
                <div
                    id="search-results"
                    role="listbox"
                    className="absolute top-full right-0 mt-2 w-80 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[80]"
                >
                    {results.length > 0 ? (
                        <>
                            <div className="max-h-80 overflow-y-auto">
                                {results.map((result, idx) => (
                                    <button
                                        key={result.id}
                                        id={`search-result-${idx}`}
                                        role="option"
                                        aria-selected={selectedIndex === idx}
                                        onClick={() => navigateToProduct(result)}
                                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                                            selectedIndex === idx
                                                ? "bg-white/10"
                                                : "hover:bg-white/5"
                                        }`}
                                    >
                                        {/* Product Image */}
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden relative">
                                            {result.image && result.image.startsWith("http") ? (
                                                <Image
                                                    src={result.image}
                                                    alt={result.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="40px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Search className="h-4 w-4 text-white/20" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white font-medium truncate">
                                                {result.shortName}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-cream/50">
                                                <span className="uppercase tracking-wider">{result.category}</span>
                                                {result.thc && result.thc !== "TBD" && (
                                                    <span className="text-secondary">THC {result.thc}</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Price */}
                                        <div className="text-sm font-bold text-cream/80 whitespace-nowrap">
                                            {result.price > 0 ? `$${result.price.toFixed(2)}` : "Quote"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {/* View All Results */}
                            <button
                                onClick={() => {
                                    router.push(`/shop?q=${encodeURIComponent(query)}`);
                                    closeSearch();
                                }}
                                className="w-full p-3 text-xs text-center text-secondary hover:text-secondary/80 border-t border-white/10 hover:bg-white/5 transition-colors uppercase tracking-wider font-bold"
                            >
                                View all results for &ldquo;{query}&rdquo;
                            </button>
                        </>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-sm text-cream/50">No products found for &ldquo;{query}&rdquo;</p>
                            <p className="text-xs text-cream/30 mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
