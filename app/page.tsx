"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// lucide-react icons available for future use: ShieldCheck, Leaf, Truck
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BentoGrid } from "@/components/BentoGrid";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import SmokeCursor from "@/components/canvas/SmokeCursor";

export default function Home() {
  // Only enable smoke cursor on non-touch devices
  const [hasMouse, setHasMouse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setHasMouse(mq.matches);
    const handler = (e: MediaQueryListEvent) => setHasMouse(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Smoke Cursor Effect — joint + smoke trail + click puff */}
      <SmokeCursor enabled={hasMouse} />

      {/* Cinematic Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Image Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-forest/40 z-10" />
          <Image
            src="/images/hero-bg.png"
            alt="Premium cannabis plants in organic living soil greenhouse — Mohawk Medibles"
            fill
            priority
            className="object-cover opacity-90"
            sizes="100vw"
          />
        </div>

        {/* Animated Gradient Overlay — blends into #0D1F0A dark forest canvas */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F0A] via-black/40 to-black/30 z-20 pointer-events-none" />

        <div className="relative z-30 text-center px-4 max-w-5xl mx-auto space-y-6">


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/20 text-white/90 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-4 backdrop-blur-md shadow-lg"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
            Tyendinaga Mohawk Territory • Established 2019
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-heading leading-[0.9]"
          >
            PREMIUM CANNABIS <br /> DISPENSARY IN CANADA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md font-sans tracking-wide"
          >
            Explore the best deals at the cannabis dispensary Tyendinaga. <span className="text-green-400 font-bold">Incredible prices on flower, vapes, and edibles await you.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col md:flex-row gap-6 justify-center pt-8"
          >
            <Link href="/shop">
              <Button size="lg" className="rounded-full text-lg h-14 px-10 bg-green-600 hover:bg-green-500 text-white hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(34,197,94,0.6)] border-none">
                Shop Collection
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="rounded-full text-lg h-14 px-10 border-white text-white hover:bg-white/20 backdrop-blur-md">
                Our Story
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Brand Scroll / Trust Indicators */}
      <section className="bg-forest border-y border-white/5 py-10 overflow-hidden relative z-40">
        <div className="flex gap-16 animate-scroll whitespace-nowrap text-cream/70 font-mono text-sm tracking-[0.2em] uppercase">
          <span>Google Trusted Store</span><span className="text-cream/40">•</span>
          <span>EEAT Certified</span><span className="text-cream/40">•</span>
          <span>Six Nations Reserve</span><span className="text-cream/40">•</span>
          <span>Organic Living Soil</span><span className="text-cream/40">•</span>
          <span>Lab Tested</span><span className="text-cream/40">•</span>
          <span>Same Day Delivery</span><span className="text-cream/40">•</span>
          <span>Google Trusted Store</span><span className="text-cream/40">•</span>
          <span>EEAT Certified</span><span className="text-cream/40">•</span>
          <span>Six Nations Reserve</span><span className="text-cream/40">•</span>
          <span>Organic Living Soil</span><span className="text-cream/40">•</span>
          <span>Lab Tested</span><span className="text-cream/40">•</span>
          <span>Same Day Delivery</span><span className="text-cream/40">•</span>
        </div>
      </section>


      {/* Category Showcase — Shop by Category */}
      <CategoryShowcase />

      {/* Featured Products — Bento Grid */}
      <BentoGrid />

    </div >
  );
}
