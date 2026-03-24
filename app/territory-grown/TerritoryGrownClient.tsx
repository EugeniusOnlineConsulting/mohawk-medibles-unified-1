"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Leaf, Heart, Users, Sprout, MapPin, ShoppingCart, Check,
  ArrowRight, Globe,
} from "lucide-react";
import { PRODUCTS, getShortName } from "@/lib/productData";
import { isTerritoryGrown } from "@/lib/territoryGrown";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { decodeHtmlEntities } from "@/lib/utils";

export default function TerritoryGrownClient() {
  const { addItem, items } = useCart();
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const territoryProducts = useMemo(
    () => PRODUCTS.filter((p) => isTerritoryGrown(p)),
    []
  );

  function handleAddToCart(product: (typeof PRODUCTS)[0]) {
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds((prev) => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    }), 2000);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(180,120,60,0.2),_transparent_60%)]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L35 25L55 30L35 35L30 55L25 35L5 30L25 25Z' fill='%23fff' opacity='0.03'/%3E%3C/svg%3E\")" }} />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Leaf className="h-5 w-5 text-amber-300" />
              <span className="text-sm font-bold tracking-wider uppercase">Mohawk Territory</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Tyendinaga Territory{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                Grown
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Proudly cultivated on Mohawk Territory. Supporting Indigenous sovereignty through cannabis.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-cream mb-6 text-center">
              Our Roots Run Deep
            </h2>
            <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground space-y-4">
              <p>
                The Tyendinaga Mohawk Territory, home of the Bay of Quinte Mohawks, has a deep
                relationship with the land stretching back thousands of years. Cannabis cultivation
                on our territory represents more than commerce&mdash;it is an expression of
                Indigenous sovereignty, self-determination, and the inherent right to govern our
                own economic future.
              </p>
              <p>
                Our territory-grown products are cultivated by Mohawk growers who understand the
                land, the climate, and the plant. Every purchase directly supports Indigenous
                families, community programs, and the preservation of Haudenosaunee culture.
              </p>
              <p>
                When you choose Territory Grown, you&apos;re choosing to support a movement&mdash;one
                that champions Indigenous rights, sustainable agriculture, and community-first
                economics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Buy Territory Grown */}
      <section className="py-16 md:py-20 bg-amber-50/50 dark:bg-amber-950/10">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-cream mb-12 text-center">
            Why Buy Territory Grown?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Users,
                title: "Supports Indigenous Economy",
                desc: "Every dollar goes directly to supporting Mohawk families and community development on Tyendinaga territory.",
                color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10",
              },
              {
                icon: Sprout,
                title: "Locally Grown = Fresher",
                desc: "Cultivated right here on the territory, our products are harvested at peak freshness and delivered fast.",
                color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10",
              },
              {
                icon: Heart,
                title: "Cultural Significance",
                desc: "Cannabis has a deep cultural connection to Indigenous communities. Territory Grown honors this heritage.",
                color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10",
              },
              {
                icon: Globe,
                title: "Community Reinvestment",
                desc: "Profits are reinvested into community programs, youth initiatives, and cultural preservation.",
                color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-card rounded-xl p-6 space-y-4 shadow-sm">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-forest dark:text-cream">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-cream">
                Territory Grown Products
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {territoryProducts.length} products cultivated on Mohawk Territory
              </p>
            </div>
          </div>

          {territoryProducts.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Leaf className="h-16 w-16 text-amber-300 mx-auto" />
              <h3 className="text-xl font-bold text-forest dark:text-cream">Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We&apos;re working with local Tyendinaga growers to curate our territory-grown collection.
                Check back soon for products cultivated right here on Mohawk Territory.
              </p>
              <Link href="/shop">
                <Button variant="outline" className="mt-4">
                  Browse All Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {territoryProducts.map((product) => (
                <div key={product.id} className="group bg-white dark:bg-card rounded-xl border border-amber-200/50 dark:border-amber-800/20 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link href={`/shop/${product.slug}`}>
                    <ProductImage
                      src={product.image}
                      alt={product.altText || product.name}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    >
                      <div className="absolute top-3 left-3 z-20">
                        <span className="inline-flex items-center gap-1 bg-amber-700/90 text-white px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase backdrop-blur-sm">
                          <Leaf className="h-3 w-3" />
                          Territory Grown
                        </span>
                      </div>
                    </ProductImage>
                  </Link>
                  <div className="p-4">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      {product.category}
                    </p>
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="font-bold text-forest dark:text-cream mb-1 hover:text-amber-700 dark:hover:text-amber-400 transition-colors line-clamp-1">
                        {getShortName(product)}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {decodeHtmlEntities(product.shortDescription)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-forest dark:text-lime">
                        ${product.price.toFixed(2)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs"
                        onClick={() => handleAddToCart(product)}
                      >
                        {addedIds.has(product.id) ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Check className="h-3 w-3" /> Added
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" /> Add
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grower Spotlight (placeholder) */}
      <section className="py-16 md:py-20 bg-muted/30 dark:bg-white/[0.02]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <MapPin className="h-10 w-10 text-amber-600 dark:text-amber-400 mx-auto" />
            <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-cream">
              Grower Spotlight
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We&apos;re partnering with local Tyendinaga cultivators to bring you their stories.
              From seed to harvest, learn about the people behind our Territory Grown collection.
              Grower profiles coming soon.
            </p>
            <Link
              href="/our-story"
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 transition-colors group"
            >
              Read Our Story
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
