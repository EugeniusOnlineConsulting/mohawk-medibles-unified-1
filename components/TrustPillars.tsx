"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/LocaleProvider";

export function TrustPillars() {
  const { t } = useLocale();

  const PILLARS = [
    {
      icon: "🧪",
      title: t("home.labTested"),
      subtitle: t("home.everyBatch"),
      description: t("home.labTestedDesc"),
    },
    {
      icon: "🏔️",
      title: t("home.indigenousOwned"),
      subtitle: t("home.andOperated"),
      description: t("home.indigenousDesc"),
    },
    {
      icon: "📦",
      title: t("home.discreetShipping"),
      subtitle: t("home.smellProof"),
      description: t("home.shippingDesc"),
    },
    {
      icon: "💰",
      title: t("home.taxFree"),
      subtitle: t("home.always"),
      description: t("home.taxFreeDesc"),
    },
  ];

  return (
    <section className="py-10 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight mb-2">{t("home.whyMohawk")}</h2>
          <p className="text-muted-foreground text-sm">{t("home.trustedBy")}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl border border-border/50 hover:border-lime/30 hover:shadow-[0_0_30px_rgba(200,230,62,0.08)] transition-all duration-300 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">{pillar.icon}</div>
              <h3 className="text-lg font-bold font-heading">{pillar.title}</h3>
              <p className="text-sm text-lime font-semibold mb-2">{pillar.subtitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
