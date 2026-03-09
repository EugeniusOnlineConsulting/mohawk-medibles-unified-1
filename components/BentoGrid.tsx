"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { getFeaturedProducts, getShortName, PRODUCTS, type Product } from "@/lib/productData";

// Use featured products for hero cards, fill rest from catalog
const gridProducts = (() => {
    const featured = getFeaturedProducts();
    const rest = PRODUCTS.filter((p) => !p.featured).slice(0, 2);
    return [...featured, ...rest].slice(0, 6);
})();

// Gradient map by category — covers ALL categories in the catalog
const gradientMap: Record<string, string> = {
    Flower: "from-green-900/50 to-black/50",
    Edibles: "from-pink-900/50 to-black/50",
    Concentrates: "from-purple-900/50 to-black/50",
    Vapes: "from-blue-900/50 to-black/50",
    Mushrooms: "from-amber-900/50 to-black/50",
    CBD: "from-teal-900/50 to-black/50",
    Brands: "from-indigo-900/50 to-black/50",
    Nicotine: "from-orange-900/50 to-black/50",
    Accessories: "from-slate-900/50 to-black/50",
    "Sexual Enhancement": "from-rose-900/50 to-black/50",
    Hash: "from-amber-900/60 to-black/50",
    Wellness: "from-teal-900/50 to-black/50",
    Pets: "from-lime-900/50 to-black/50",
    "Bath & Body": "from-cyan-900/50 to-black/50",
    Hookah: "from-red-900/50 to-black/50",
    Sale: "from-yellow-900/50 to-black/50",
};

export function BentoGrid() {
    return (
        <section className="py-24 bg-[#0D1F0A] text-white">
            <div className="container mx-auto px-6">
                <div className="mb-16 text-center space-y-4">
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tight font-heading">The Collection.</h2>
                    <p className="text-zinc-300 text-xl max-w-2xl mx-auto">Curated for the connoisseur. Engineered for effect.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[500px]">
                    {gridProducts.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className={`group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-white/5 ${product.featured ? "md:col-span-2" : "md:col-span-1"
                                }`}
                        >
                            {/* Background Image with Watermark */}
                            <div className="absolute inset-0">
                                {product.image && !product.image.includes("placeholder") ? (
                                    <>
                                        <Image
                                            src={product.image}
                                            alt={product.altText}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                                        />
                                        {/* Watermark overlay */}
                                        <div className="absolute bottom-3 right-3 pointer-events-none z-10">
                                            <Image
                                                src="/assets/logos/medibles-logo2.png"
                                                alt=""
                                                width={36}
                                                height={36}
                                                className="opacity-[0.15] select-none"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                                        <Leaf className="h-24 w-24 text-green-900/30" />
                                    </div>
                                )}
                                <div className={`absolute inset-0 bg-gradient-to-t ${gradientMap[product.category] || "from-zinc-900/80 to-black/50"} via-transparent to-transparent`} />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium tracking-wider uppercase border border-white/10">
                                        {product.category} • {product.specs.type}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-md text-xs font-bold text-green-400 border border-green-500/20">
                                        {product.specs.thc} THC
                                    </span>
                                </div>

                                <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div>
                                        <h3 className="text-3xl font-bold font-heading">{getShortName(product)}</h3>
                                        <p className="text-white/85 text-lg line-clamp-2">{product.shortDescription}</p>
                                    </div>

                                    {/* Terpene chips */}
                                    {product.specs.terpenes.length > 0 && (
                                        <div className="flex gap-2 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {product.specs.terpenes.map((t) => (
                                                <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-white/75 border border-white/10">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pt-4">
                                        <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                                        <Link href={`/shop/${product.slug}`}>
                                            <Button className="rounded-full bg-white text-black hover:bg-zinc-200">
                                                View Product
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
