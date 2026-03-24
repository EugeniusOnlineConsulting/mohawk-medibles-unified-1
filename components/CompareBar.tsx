"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight, Trash2 } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { PRODUCTS } from "@/lib/productData";
import { Button } from "@/components/ui/button";

export default function CompareBar() {
  const { slugs, remove, clear, count } = useCompare();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || count === 0) return null;

  // Look up product info from the static product list for thumbnails
  const compareProducts = slugs
    .map((slug) => PRODUCTS.find((p) => p.slug === slug))
    .filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.3)] border-t border-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Product thumbnails */}
        <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
          {compareProducts.map((product) =>
            product ? (
              <div
                key={product.slug}
                className="relative flex-shrink-0 group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shadow-md">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  onClick={() => remove(product.slug)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  aria-label={`Remove ${product.name} from comparison`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null
          )}
          {/* Empty slots */}
          {Array.from({ length: 4 - count }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-12 h-12 rounded-lg border-2 border-dashed border-border/50 flex-shrink-0"
            />
          ))}
        </div>

        {/* Info */}
        <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
          {count}/4 products
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-red-400 gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          <Button asChild size="sm" variant="brand" className="gap-1.5">
            <Link href={`/compare?products=${slugs.join(",")}`}>
              Compare <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
