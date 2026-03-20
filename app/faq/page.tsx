/**
 * FAQ — Mohawk Medibles
 * Frequently asked questions with expandable sections.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, MessageSquare } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface FaqItem {
    q: string;
    a: string;
}

interface FaqSection {
    title: string;
    items: FaqItem[];
}

function FaqAccordion({ item }: { item: FaqItem }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-border last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <span className="text-sm font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors pr-4">
                    {item.q}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-muted-foreground/60 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="pb-4 text-sm text-muted-foreground leading-relaxed pr-8">
                    {item.a}
                </div>
            )}
        </div>
    );
}

export default function FaqPage() {
    const [search, setSearch] = useState("");
    const { t } = useLocale();

    const FAQ_DATA: FaqSection[] = [
        {
            title: t("faq.orderingPayment"),
            items: [
                { q: t("faq.faqQ1"), a: t("faq.faqA1") },
                { q: t("faq.faqQ2"), a: t("faq.faqA2") },
                { q: t("faq.faqQ3"), a: t("faq.faqA3") },
                { q: t("faq.faqQ4"), a: t("faq.faqA4") },
                { q: t("faq.faqQ5"), a: t("faq.faqA5") },
            ],
        },
        {
            title: t("faq.shippingDelivery"),
            items: [
                { q: t("faq.faqQ6"), a: t("faq.faqA6") },
                { q: t("faq.faqQ7"), a: t("faq.faqA7") },
                { q: t("faq.faqQ8"), a: t("faq.faqA8") },
                { q: t("faq.faqQ9"), a: t("faq.faqA9") },
                { q: t("faq.faqQ10"), a: t("faq.faqA10") },
                { q: t("faq.faqQ11"), a: t("faq.faqA11") },
            ],
        },
        {
            title: t("faq.productsQuality"),
            items: [
                { q: t("faq.faqQ12"), a: t("faq.faqA12") },
                { q: t("faq.faqQ13"), a: t("faq.faqA13") },
                { q: t("faq.faqQ14"), a: t("faq.faqA14") },
                { q: t("faq.faqQ15"), a: t("faq.faqA15") },
            ],
        },
        {
            title: t("faq.returnsRefunds"),
            items: [
                { q: t("faq.faqQ16"), a: t("faq.faqA16") },
                { q: t("faq.faqQ17"), a: t("faq.faqA17") },
                { q: t("faq.faqQ18"), a: t("faq.faqA18") },
            ],
        },
        {
            title: t("faq.accountPrivacy"),
            items: [
                { q: t("faq.faqQ19"), a: t("faq.faqA19") },
                { q: t("faq.faqQ20"), a: t("faq.faqA20") },
                { q: t("faq.faqQ21"), a: t("faq.faqA21") },
            ],
        },
    ];

    const filteredSections = FAQ_DATA.map((section) => ({
        ...section,
        items: section.items.filter(
            (item) =>
                item.q.toLowerCase().includes(search.toLowerCase()) ||
                item.a.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter((section) => section.items.length > 0);

    return (
        <div className="relative min-h-screen bg-background">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='currentColor' stroke-width='0.5'%3E%3Cpath d='M40 0L60 20L40 40L20 20Z'/%3E%3Cpath d='M0 40L20 20L40 40L20 60Z'/%3E%3Cpath d='M40 40L60 20L80 40L60 60Z'/%3E%3Cpath d='M40 40L60 60L40 80L20 60Z'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "80px 80px" }} />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime/[0.04] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-forest/[0.05] dark:bg-lime/[0.03] rounded-full blur-[100px] -translate-x-1/4" />
            </div>

            {/* Header */}
            <section className="relative z-10 pt-24 pb-8">
                <div className="max-w-3xl mx-auto px-6">
                    <p className="text-sm uppercase tracking-widest text-green-600 dark:text-green-400 font-bold mb-4">{t("faq.badge")}</p>
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                        {t("faq.title")}
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        {t("faq.subtitle")}
                    </p>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                        <input
                            type="text"
                            placeholder={t("faq.searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card focus:ring-2 focus:ring-forest/30 outline-none transition text-foreground"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="relative z-10 pb-20">
                <div className="max-w-3xl mx-auto px-6 space-y-8">
                    {filteredSections.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                {t("faq.noResultsFor")} &ldquo;{search}&rdquo;
                            </p>
                            <p className="text-sm text-muted-foreground/60">
                                {t("faq.noResultsHint")}{" "}
                                <Link href="/contact" className="text-green-600 dark:text-green-400 underline">
                                    {t("faq.contactUsLink")}
                                </Link>{" "}
                                {t("faq.noResultsHintEnd")}
                            </p>
                        </div>
                    ) : (
                        filteredSections.map((section) => (
                            <div key={section.title}>
                                <h2 className="text-lg font-bold text-foreground mb-3">{section.title}</h2>
                                <div className="bg-card border border-border rounded-xl px-6">
                                    {section.items.map((item) => (
                                        <FaqAccordion key={item.q} item={item} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Still Need Help */}
                    <div className="bg-forest/5 dark:bg-green-900/20 border border-forest/10 dark:border-green-800/30 rounded-xl p-8 text-center">
                        <MessageSquare className="h-10 w-10 text-forest dark:text-leaf mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground mb-2">{t("faq.stillHaveQuestions")}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("faq.stillHaveQuestionsDesc")}
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link
                                href="/contact"
                                className="inline-block bg-forest text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-forest/90 transition-colors"
                            >
                                {t("faq.contactUs")}
                            </Link>
                            <a
                                href="mailto:info@mohawkmedibles.ca"
                                className="inline-block border border-forest text-forest dark:text-leaf dark:border-leaf px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-forest/5 transition-colors"
                            >
                                {t("faq.emailSupport")}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
