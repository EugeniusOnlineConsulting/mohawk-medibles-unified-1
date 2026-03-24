"use client";

import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";
import { PRODUCTS, getShortName } from "@/lib/productData";
import { isTerritoryGrown } from "@/lib/territoryGrown";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export default function TerritoryGrownSection() {
  const { addItem } = useCart();

  // Get territory-grown products, limit to 6
  const territoryProducts = PRODUCTS.filter((p) => isTerritoryGrown(p)).slice(0, 6);

  // Don't render if no qualifying products
  if (territoryProducts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/10 dark:via-[#0f0f18] dark:to-[#0f0f18]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-700/10 dark:bg-amber-600/15 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400">
                From Our Territory
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-cream tracking-tight">
              Tyendinaga Territory Grown
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              Proudly cultivated on Mohawk Territory. Supporting Indigenous sovereignty through cannabis.
            </p>
          </div>
          <Link
            href="/territory-grown"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors group"
          >
            View All Territory Grown
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {territoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group bg-white dark:bg-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-amber-200/50 dark:border-amber-800/20"
            >
              <div className="relative">
                <ProductImage
                  src={product.image}
                  alt={product.altText || product.name}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                >
                  <div className="absolute top-2 left-2 z-20">
                    <span className="inline-flex items-center gap-1 bg-amber-700/90 text-white px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase backdrop-blur-sm">
                      <Leaf className="h-2.5 w-2.5" />
                      Territory
                    </span>
                  </div>
                </ProductImage>
              </div>
              <div className="p-3">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                  {product.category}
                </p>
                <h3 className="font-bold text-sm text-forest dark:text-cream line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {getShortName(product)}
                </h3>
                <p className="text-sm font-bold text-forest dark:text-lime mt-1">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
