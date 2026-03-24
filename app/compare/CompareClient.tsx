"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ShoppingCart,
  Check,
  Star,
  ArrowLeft,
  Trash2,
  GitCompareArrows,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useCompare } from "@/hooks/useCompare";
import { PRODUCTS, type Product } from "@/lib/productData";
import { decodeHtmlEntities } from "@/lib/utils";

export default function CompareClient() {
  const searchParams = useSearchParams();
  const { slugs: storedSlugs, remove, clear } = useCompare();
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Merge URL params with localStorage
  const activeSlugs = useMemo(() => {
    const urlParam = searchParams.get("products");
    if (urlParam) {
      return urlParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4);
    }
    return storedSlugs;
  }, [searchParams, storedSlugs]);

  // Look up products from static data
  const compareProducts = useMemo(() => {
    return activeSlugs
      .map((slug) => PRODUCTS.find((p) => p.slug === slug))
      .filter((p): p is Product => p !== undefined);
  }, [activeSlugs]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const handleRemove = (slug: string) => {
    remove(slug);
    // Also update URL if it has params
    if (searchParams.get("products")) {
      const remaining = activeSlugs.filter((s) => s !== slug);
      if (remaining.length > 0) {
        window.history.replaceState(
          null,
          "",
          `/compare?products=${remaining.join(",")}`
        );
      } else {
        window.history.replaceState(null, "", "/compare");
      }
    }
  };

  const handleClearAll = () => {
    clear();
    window.history.replaceState(null, "", "/compare");
  };

  const getStrainColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "indica":
        return "bg-purple-500/20 text-purple-300";
      case "sativa":
        return "bg-yellow-500/20 text-yellow-300";
      case "hybrid":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStockStatus = (product: Product) => {
    // Use price as proxy - $0 means out of stock
    return product.price > 0;
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
      </div>
    );
  }

  // Spec rows for comparison table
  const specRows: {
    label: string;
    render: (p: Product) => React.ReactNode;
  }[] = [
    {
      label: "Price",
      render: (p) => (
        <span className="font-bold text-lg text-forest dark:text-lime">
          ${p.price.toFixed(2)}
        </span>
      ),
    },
    {
      label: "THC",
      render: (p) =>
        p.specs.thc && p.specs.thc !== "TBD" ? (
          <span className="font-semibold text-foreground">{p.specs.thc}</span>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    },
    {
      label: "CBD",
      render: (p) =>
        p.specs.cbd && p.specs.cbd !== "TBD" ? (
          <span className="font-semibold text-foreground">{p.specs.cbd}</span>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    },
    {
      label: "Strain Type",
      render: (p) =>
        p.specs.type ? (
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getStrainColor(
              p.specs.type
            )}`}
          >
            {p.specs.type}
          </span>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    },
    {
      label: "Weight",
      render: (p) =>
        p.specs.weight && p.specs.weight !== "TBD" ? (
          <span className="text-foreground">{p.specs.weight}</span>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    },
    {
      label: "Terpenes",
      render: (p) =>
        p.specs.terpenes.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {p.specs.terpenes.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-green-900/30 text-green-300 text-[10px] font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    },
    {
      label: "Category",
      render: (p) => (
        <span className="text-foreground">{p.category}</span>
      ),
    },
    {
      label: "Availability",
      render: (p) => {
        const inStock = getStockStatus(p);
        return inStock ? (
          <span className="inline-flex items-center gap-1.5 text-green-400 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            In Stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Out of Stock
          </span>
        );
      },
    },
    {
      label: "Description",
      render: (p) => (
        <p className="text-xs text-muted-foreground leading-relaxed text-left max-w-[200px] mx-auto">
          {decodeHtmlEntities(p.shortDescription) || "\u2014"}
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-forest/10 to-transparent dark:from-forest/5 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-forest dark:text-cream flex items-center gap-3">
                <GitCompareArrows className="h-8 w-8 text-forest dark:text-lime" />
                Compare Products
              </h1>
              <p className="text-muted-foreground mt-1">
                {compareProducts.length > 0
                  ? `Comparing ${compareProducts.length} product${compareProducts.length !== 1 ? "s" : ""} side by side`
                  : "Add products from the shop to compare them"}
              </p>
            </div>
            {compareProducts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-red-400 gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        {compareProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-forest/10 dark:bg-forest/5 flex items-center justify-center">
              <GitCompareArrows className="h-10 w-10 text-forest/50 dark:text-lime/50" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              No products to compare
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse the shop and click the compare icon on products you want to
              compare. You can compare up to 4 products side by side.
            </p>
            <Button asChild variant="brand" size="lg">
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table view */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-4 text-left text-muted-foreground font-medium text-sm min-w-[140px] align-bottom">
                        Product
                      </th>
                      {compareProducts.map((p) => (
                        <th
                          key={p.id}
                          className="p-4 min-w-[220px] align-bottom"
                        >
                          <div className="relative">
                            {/* Remove button */}
                            <button
                              onClick={() => handleRemove(p.slug)}
                              className="absolute -top-2 right-0 w-7 h-7 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                              aria-label={`Remove ${p.name}`}
                            >
                              <X className="h-4 w-4" />
                            </button>

                            <Link
                              href={`/shop/${p.slug}`}
                              className="block group"
                            >
                              <div className="w-32 h-32 relative mx-auto mb-3 rounded-xl overflow-hidden bg-muted shadow-lg group-hover:shadow-xl transition-shadow">
                                <Image
                                  src={p.image}
                                  alt={p.altText || p.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="128px"
                                />
                              </div>
                              <h3 className="text-foreground font-bold text-sm group-hover:text-forest dark:group-hover:text-lime transition-colors line-clamp-2 text-center">
                                {p.name}
                              </h3>
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map((row, i) => (
                      <tr
                        key={row.label}
                        className={
                          i % 2 === 0
                            ? "bg-muted/30"
                            : ""
                        }
                      >
                        <td className="p-4 text-muted-foreground font-medium text-sm">
                          {row.label}
                        </td>
                        {compareProducts.map((p) => (
                          <td
                            key={p.id}
                            className="p-4 text-center"
                          >
                            {row.render(p)}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Add to Cart row */}
                    <tr className="bg-muted/30">
                      <td className="p-4" />
                      {compareProducts.map((p) => (
                        <td key={p.id} className="p-4 text-center">
                          <div className="flex flex-col gap-2 items-center">
                            <Button
                              size="sm"
                              variant="brand"
                              className={`gap-1.5 w-full max-w-[180px] transition-all duration-200 ${
                                addedIds.has(p.id)
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }`}
                              onClick={() => handleAddToCart(p)}
                              disabled={p.price === 0}
                            >
                              {addedIds.has(p.id) ? (
                                <>
                                  <Check className="h-4 w-4" /> Added!
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4" /> Add to
                                  Cart
                                </>
                              )}
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="w-full max-w-[180px]"
                            >
                              <Link href={`/shop/${p.slug}`}>View Details</Link>
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-6">
              {compareProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-card rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Header with image */}
                  <div className="relative">
                    <div className="aspect-square relative bg-muted">
                      <Image
                        src={p.image}
                        alt={p.altText || p.name}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    </div>
                    <button
                      onClick={() => handleRemove(p.slug)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center"
                      aria-label={`Remove ${p.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {p.specs.type && (
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${getStrainColor(
                          p.specs.type
                        )} backdrop-blur`}
                      >
                        {p.specs.type}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <Link href={`/shop/${p.slug}`}>
                      <h3 className="font-bold text-lg text-foreground hover:text-forest dark:hover:text-lime transition-colors">
                        {p.name}
                      </h3>
                    </Link>

                    <div className="text-2xl font-bold text-forest dark:text-lime">
                      ${p.price.toFixed(2)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {p.specs.thc && p.specs.thc !== "TBD" && (
                        <div>
                          <span className="text-muted-foreground">THC: </span>
                          <span className="font-semibold text-foreground">
                            {p.specs.thc}
                          </span>
                        </div>
                      )}
                      {p.specs.cbd && p.specs.cbd !== "TBD" && (
                        <div>
                          <span className="text-muted-foreground">CBD: </span>
                          <span className="font-semibold text-foreground">
                            {p.specs.cbd}
                          </span>
                        </div>
                      )}
                      {p.specs.weight && p.specs.weight !== "TBD" && (
                        <div>
                          <span className="text-muted-foreground">
                            Weight:{" "}
                          </span>
                          <span className="font-semibold text-foreground">
                            {p.specs.weight}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">
                          Category:{" "}
                        </span>
                        <span className="text-foreground">{p.category}</span>
                      </div>
                    </div>

                    {p.specs.terpenes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.specs.terpenes.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-green-900/30 text-green-300 text-[10px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {p.shortDescription && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {decodeHtmlEntities(p.shortDescription)}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="brand"
                        className={`flex-1 gap-1.5 ${
                          addedIds.has(p.id)
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }`}
                        onClick={() => handleAddToCart(p)}
                        disabled={p.price === 0}
                      >
                        {addedIds.has(p.id) ? (
                          <>
                            <Check className="h-4 w-4" /> Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" /> Add to Cart
                          </>
                        )}
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/shop/${p.slug}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
