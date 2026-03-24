"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Gift, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/hooks/useCart";

export default function SharedWishlistPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { addItem } = useCart();

  const { data, isLoading, error } = trpc.wishlistShare.getShared.useQuery(
    { code },
    { retry: false }
  );

  function handleAddToCart(item: NonNullable<typeof data>["items"][0]) {
    addItem({
      id: String(item.id),
      name: item.name,
      price: item.salePrice ?? item.price,
      quantity: 1,
      image: item.image,
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-forest/30 border-t-forest rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Wishlist Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This wishlist may be private or the link may have expired.
          </p>
          <Link href="/shop">
            <Button className="bg-forest hover:bg-forest/90 text-white">
              Browse Our Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-forest/10 dark:bg-lime/10">
              <Gift className="h-8 w-8 text-forest dark:text-lime" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{data.title}</h1>
              <p className="text-muted-foreground mt-1">
                This wishlist was shared by{" "}
                <span className="font-semibold text-foreground">
                  {data.ownerName}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {data.items.length} product{data.items.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {/* Products grid */}
        {data.items.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-border bg-card/50">
            <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              This wishlist is empty right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <Link href={`/product/${item.slug}`}>
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.altText || item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.salePrice && item.salePrice < item.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{Math.round(((item.price - item.salePrice) / item.price) * 100)}%
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-forest dark:hover:text-lime transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.category}
                  </p>
                  <div className="flex items-center gap-2">
                    {item.salePrice && item.salePrice < item.price ? (
                      <>
                        <span className="font-bold text-forest dark:text-lime">
                          ${item.salePrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ${item.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-forest dark:text-lime">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-forest text-white text-xs font-medium rounded-lg hover:bg-forest/90 dark:bg-lime dark:text-charcoal-deep dark:hover:bg-lime/90 transition-colors mt-1"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12 py-8 rounded-2xl border border-border bg-card/50">
          <p className="text-muted-foreground mb-4">
            Want to create your own wishlist?
          </p>
          <Link href="/shop">
            <Button className="bg-forest hover:bg-forest/90 text-white dark:bg-lime dark:text-charcoal-deep dark:hover:bg-lime/90">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
