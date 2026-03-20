"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleProvider";

function calcTimeLeft(targetHour: number, targetMinute: number) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 59, 999);
  if (now >= target) target.setDate(target.getDate() + 1);
  const diff = target.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function useCountdown(targetHour = 23, targetMinute = 59) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetHour, targetMinute));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetHour, targetMinute));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetHour, targetMinute]);

  return timeLeft;
}

const DEALS = [
  {
    title: "AAAA Premium Flower",
    originalPrice: 120,
    salePrice: 65,
    unit: "/oz",
    badge: "BEST SELLER",
    gradient: "from-[#1a3a0e]/90 to-[#0f2a0b]/80",
    span: "md:col-span-2 md:row-span-2",
    image: "https://mohawkmedibles.ca/wp-content/uploads/2025/09/Sun-Rock-04-with-logo.png",
    alt: "AAAA Premium Sun Rock flower deal — $65 per ounce",
  },
  {
    title: "1000mg Gummies",
    originalPrice: 40,
    salePrice: 20,
    unit: "/pack",
    badge: "50% OFF",
    gradient: "from-[#1e1e2e]/90 to-[#151520]/80",
    span: "",
    image: "https://mohawkmedibles.ca/wp-content/uploads/2025/11/Rainbow-Pieces-get-wrecked-on-the-rainbow-with-logo.png",
    alt: "1000mg Rainbow Pieces gummies deal — 50% off",
  },
  {
    title: "Premium Shatter",
    originalPrice: 40,
    salePrice: 30,
    unit: "/g",
    badge: "25% OFF",
    gradient: "from-[#2a1e34]/90 to-[#1a1525]/80",
    span: "",
    image: "https://mohawkmedibles.ca/wp-content/uploads/2025/07/Zillionaire-Shatter-Photoroom.png",
    alt: "Zillionaire premium shatter deal — $30 per gram",
  },
];

export function DealsSection() {
  const { t } = useLocale();
  const { hours, minutes, seconds } = useCountdown();
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="py-12 px-4 bg-card grain-overlay relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight text-foreground">{t("home.todaysDeals")}</h2>
            <p className="text-muted-foreground text-sm">{t("home.dealsSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">{t("home.endsIn")}</span>
            <div className="flex gap-1">
              {[pad(hours), pad(minutes), pad(seconds)].map((unit, i) => (
                <span key={i} className="bg-lime/15 dark:bg-lime/10 border border-lime/30 dark:border-lime/20 text-lime-dark dark:text-lime font-mono font-bold text-lg px-2.5 py-1 rounded-lg">
                  {unit}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4">
          {DEALS.map((deal, i) => (
            <motion.div
              key={deal.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col justify-end min-h-[200px] group ${deal.span}`}
            >
              {/* Product background image */}
              <div className="absolute inset-0">
                <Image
                  src={deal.image}
                  alt={deal.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 dark:opacity-50 group-hover:opacity-85 dark:group-hover:opacity-70"
                  sizes={deal.span ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${deal.gradient} via-transparent to-transparent`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 dark:from-black/70 dark:via-black/30 dark:to-transparent" />
              </div>

              <div className="absolute top-4 left-4 z-10 bg-lime text-charcoal-deep text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider animate-glow-pulse">
                {deal.badge}
              </div>
              <div className="mt-auto relative z-10">
                <h3 className="text-xl md:text-2xl font-bold text-white font-heading mb-2 drop-shadow-md">{deal.title}</h3>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-white/50 line-through text-sm drop-shadow-sm">${deal.originalPrice}{deal.unit}</span>
                  <span className="text-lime-light text-2xl md:text-3xl font-black drop-shadow-md">${deal.salePrice}{deal.unit}</span>
                </div>
                <Link href="/shop">
                  <Button size="sm" className="bg-lime text-charcoal-deep hover:bg-lime-light font-bold rounded-full">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground/60 text-xs">{t("home.promoCode")} <span className="text-lime-dark dark:text-lime font-bold">MOHAWK420</span> {t("home.promoDiscount")}</p>
        </div>
      </div>
    </section>
  );
}
