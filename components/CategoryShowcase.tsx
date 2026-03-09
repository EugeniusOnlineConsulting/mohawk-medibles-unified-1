"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoryRepresentativeProducts } from "@/lib/productData";
import ProductImage from "@/components/ProductImage";

// Six main product categories to showcase on the homepage
const SHOWCASE_CATEGORIES = [
    "Flower",
    "Edibles",
    "Concentrates",
    "Vapes",
    "Mushrooms",
    "CBD",
];

const CATEGORY_TAGLINES: Record<string, string> = {
    Flower: "Premium AAAA craft strains",
    Edibles: "Gummies, chocolates & more",
    Concentrates: "Tinctures, shatter & wax",
    Vapes: "Potent disposable pens",
    Mushrooms: "Psilocybin microdose & macro",
    CBD: "Wellness oils & topicals",
};

const CATEGORY_GRADIENT: Record<string, string> = {
    Flower: "from-green-600/20 to-transparent",
    Edibles: "from-pink-600/20 to-transparent",
    Concentrates: "from-purple-600/20 to-transparent",
    Vapes: "from-blue-600/20 to-transparent",
    Mushrooms: "from-amber-600/20 to-transparent",
    CBD: "from-teal-600/20 to-transparent",
};

export function CategoryShowcase() {
    const showcaseData = getCategoryRepresentativeProducts(SHOWCASE_CATEGORIES);

    if (showcaseData.length === 0) return null;

    return (
        <section className="py-24 bg-[#0D1F0A] text-white overflow-hidden relative">
            {/* Top divider */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="mb-16 text-center space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold tracking-tight font-heading"
                    >
                        Shop by Category
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-300 text-lg max-w-2xl mx-auto"
                    >
                        Explore our curated collections — premium products lab-tested to meet the Empire Standard.
                    </motion.p>
                </div>

                {/* Category Grid: 2 cols mobile, 3 cols md, 3 cols lg (2 rows) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {showcaseData.map(({ category, product, count }, i) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                        >
                            <Link
                                href={`/shop?category=${encodeURIComponent(category)}`}
                                className="group block relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/15 transition-all duration-500"
                            >
                                {/* Product Image with watermark */}
                                <div className="relative aspect-square overflow-hidden">
                                    <ProductImage
                                        src={product.image}
                                        alt={`${category} — ${product.altText || product.name}`}
                                        variant="bento"
                                        sizes="(max-width: 640px) 50vw, 33vw"
                                    />

                                    {/* Category gradient overlay */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-t ${CATEGORY_GRADIENT[category] || "from-green-600/20 to-transparent"} opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none`}
                                    />

                                    {/* Bottom gradient for text readability */}
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                                    <div className="flex items-end justify-between gap-2">
                                        <div className="space-y-1">
                                            <h3 className="text-xl md:text-2xl font-bold font-heading tracking-tight">
                                                {category}
                                            </h3>
                                            <p className="text-xs md:text-sm text-white/80 line-clamp-1">
                                                {CATEGORY_TAGLINES[category] || "Premium products"}
                                            </p>
                                            <span className="inline-block text-[10px] md:text-xs text-white/65 font-mono uppercase tracking-wider">
                                                {count} products
                                            </span>
                                        </div>

                                        {/* Arrow indicator */}
                                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                                            <ArrowRight className="h-4 w-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Starting from price badge */}
                                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-green-500/20 backdrop-blur-md text-[10px] md:text-xs font-bold text-green-400 border border-green-500/20">
                                    From ${product.price.toFixed(0)}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* View All CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/90 hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
                    >
                        View All 288+ Products
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
