"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/components/LocaleProvider";

export function EffectFilter() {
  const { t } = useLocale();

  const EFFECTS = [
    { label: t("home.effectRelax"), emoji: "😌", query: "relax", color: "from-purple-500/30 to-purple-900/15 dark:from-purple-500/20 dark:to-purple-900/20" },
    { label: t("home.effectEnergy"), emoji: "⚡", query: "energy", color: "from-yellow-500/30 to-yellow-900/15 dark:from-yellow-500/20 dark:to-yellow-900/20" },
    { label: t("home.effectCreate"), emoji: "🎨", query: "creative", color: "from-pink-500/30 to-rose-900/15 dark:from-pink-500/20 dark:to-rose-900/20" },
    { label: t("home.effectSleep"), emoji: "😴", query: "sleep", color: "from-indigo-500/30 to-blue-900/15 dark:from-indigo-500/20 dark:to-blue-900/20" },
    { label: t("home.effectParty"), emoji: "🎉", query: "party", color: "from-red-500/30 to-pink-900/15 dark:from-red-500/20 dark:to-pink-900/20" },
    { label: t("home.effectWellness"), emoji: "🧘", query: "wellness", color: "from-teal-500/30 to-emerald-900/15 dark:from-teal-500/20 dark:to-emerald-900/20" },
    { label: t("home.effectPain"), emoji: "💊", query: "pain", color: "from-green-500/30 to-forest/15 dark:from-green-500/20 dark:to-forest/20" },
  ];

  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold font-heading tracking-tight mb-2"
        >
          {t("home.whatLookingFor")}
        </motion.h2>
        <p className="text-muted-foreground text-sm mb-8">{t("home.shopByFeeling")}</p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {EFFECTS.map((effect) => (
            <Link
              key={effect.query}
              href={`/shop?effect=${effect.query}`}
              className={`group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br ${effect.color} border border-border hover:border-lime/50 hover:shadow-[0_0_20px_rgba(200,230,62,0.15)] transition-all duration-300`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform" aria-hidden="true">{effect.emoji}</span>
              <span className="font-semibold text-sm tracking-wide">{effect.label}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
