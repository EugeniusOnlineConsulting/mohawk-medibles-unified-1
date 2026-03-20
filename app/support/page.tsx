/**
 * Support — Mohawk Medibles
 * Help center with live AI chat, contact info, and common topics.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    MessageSquare, Mail, Phone, MapPin, Clock, Truck,
    CreditCard, ShieldCheck, Package, ChevronDown, Search,
    HelpCircle, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleProvider";

// ─── Support Topic Type ─────────────────────────────────────

interface SupportTopic {
    icon: typeof Mail;
    title: string;
    description: string;
    items: { q: string; a: string }[];
}

// ─── Expandable FAQ Item ───────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-border/50 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-3 text-left group"
            >
                <span className="text-sm font-medium text-foreground group-hover:text-brand-leaf transition-colors pr-4">{q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <p className="text-sm text-muted-foreground pb-3 leading-relaxed">{a}</p>
            )}
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { t } = useLocale();

    const SUPPORT_TOPICS: SupportTopic[] = [
        {
            icon: Truck,
            title: t("support.topicShippingTitle"),
            description: t("support.topicShippingDesc"),
            items: [
                { q: t("support.supportShipQ1"), a: t("support.supportShipA1") },
                { q: t("support.supportShipQ2"), a: t("support.supportShipA2") },
                { q: t("support.supportShipQ3"), a: t("support.supportShipA3") },
                { q: t("support.supportShipQ4"), a: t("support.supportShipA4") },
            ],
        },
        {
            icon: CreditCard,
            title: t("support.topicPaymentsTitle"),
            description: t("support.topicPaymentsDesc"),
            items: [
                { q: t("support.supportPayQ1"), a: t("support.supportPayA1") },
                { q: t("support.supportPayQ2"), a: t("support.supportPayA2") },
                { q: t("support.supportPayQ3"), a: t("support.supportPayA3") },
            ],
        },
        {
            icon: Package,
            title: t("support.topicOrdersTitle"),
            description: t("support.topicOrdersDesc"),
            items: [
                { q: t("support.supportOrderQ1"), a: t("support.supportOrderA1") },
                { q: t("support.supportOrderQ2"), a: t("support.supportOrderA2") },
                { q: t("support.supportOrderQ3"), a: t("support.supportOrderA3") },
            ],
        },
        {
            icon: ShieldCheck,
            title: t("support.topicSafetyTitle"),
            description: t("support.topicSafetyDesc"),
            items: [
                { q: t("support.supportSafetyQ1"), a: t("support.supportSafetyA1") },
                { q: t("support.supportSafetyQ2"), a: t("support.supportSafetyA2") },
                { q: t("support.supportSafetyQ3"), a: t("support.supportSafetyA3") },
            ],
        },
    ];

    // Filter topics by search
    const filteredTopics = searchQuery.trim()
        ? SUPPORT_TOPICS.map((topic) => ({
              ...topic,
              items: topic.items.filter(
                  (item) =>
                      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.a.toLowerCase().includes(searchQuery.toLowerCase())
              ),
          })).filter((topic) => topic.items.length > 0)
        : SUPPORT_TOPICS;

    return (
        <main className="relative min-h-screen page-glass text-foreground">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='currentColor' stroke-width='0.5'%3E%3Cpath d='M40 0L60 20L40 40L20 20Z'/%3E%3Cpath d='M0 40L20 20L40 40L20 60Z'/%3E%3Cpath d='M40 40L60 20L80 40L60 60Z'/%3E%3Cpath d='M40 40L60 60L40 80L20 60Z'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "80px 80px" }} />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime/[0.04] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-forest/[0.05] dark:bg-lime/[0.03] rounded-full blur-[100px] -translate-x-1/4" />
            </div>

            {/* Hero */}
            <section className="relative z-10 py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-foreground">
                        {t("support.title")}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        {t("support.subtitle")}
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("support.searchPlaceholder")}
                            className="w-full pl-12 pr-4 py-4 rounded-full bg-card text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 shadow-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Contact Cards */}
            <section className="relative z-10 py-10 border-b border-border">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-5 glass-card border border-border rounded-xl hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-foreground text-sm">{t("support.liveAiChat")}</div>
                                <div className="text-xs text-muted-foreground">{t("support.liveAiChatDesc")}</div>
                            </div>
                        </div>
                        <a
                            href="mailto:info@mohawkmedibles.ca"
                            className="flex items-center gap-4 p-5 glass-card border border-border rounded-xl hover:shadow-md transition-shadow"
                        >
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-foreground text-sm">{t("support.emailUs")}</div>
                                <div className="text-xs text-muted-foreground">{t("support.emailUsDesc")}</div>
                            </div>
                        </a>
                        <a
                            href="tel:+16133966728"
                            className="flex items-center gap-4 p-5 glass-card border border-border rounded-xl hover:shadow-md transition-shadow"
                        >
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-foreground text-sm">{t("support.callUs")}</div>
                                <div className="text-xs text-muted-foreground">{t("support.callUsDesc")}</div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* Support Topics */}
            <section className="relative z-10 py-12">
                <div className="max-w-5xl mx-auto px-4">
                    {filteredTopics.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground mb-2">{t("support.noResultsFor")} &ldquo;{searchQuery}&rdquo;</p>
                            <p className="text-sm text-muted-foreground/70">{t("support.noResultsHint")}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredTopics.map((topic) => (
                                <div
                                    key={topic.title}
                                    className="glass-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <topic.icon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-foreground">{topic.title}</h2>
                                            <p className="text-xs text-muted-foreground">{topic.description}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-0">
                                        {topic.items.map((item) => (
                                            <FaqItem key={item.q} q={item.q} a={item.a} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Store Info */}
            <section className="relative z-10 py-12 border-t border-border">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-foreground mb-6 text-center font-serif">
                        {t("support.visitUs")}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            <div>
                                <div className="font-semibold text-foreground text-sm">{t("support.locationLabel")}</div>
                                <div className="text-sm text-muted-foreground">
                                    {t("support.locationAddress1")}<br />
                                    {t("support.locationAddress2")}<br />
                                    {t("support.locationAddress3")}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            <div>
                                <div className="font-semibold text-foreground text-sm">{t("support.hoursLabel")}</div>
                                <div className="text-sm text-muted-foreground">
                                    {t("support.hoursValue1")}<br />
                                    {t("support.hoursValue2")}<br />
                                    {t("support.hoursValue3")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 py-16">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">
                        {t("support.stillNeedHelp")}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        {t("support.stillNeedHelpDesc")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/faq"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 glass-card border border-border text-foreground font-semibold rounded-full hover:shadow-md transition-all"
                        >
                            {t("support.browseFullFaq")}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-foreground dark:text-white font-semibold rounded-full transition-all hover:scale-105 shadow-lg"
                        >
                            {t("support.contactUsDirectly")}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
