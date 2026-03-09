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

// ─── Support Topics ────────────────────────────────────────

interface SupportTopic {
    icon: typeof Mail;
    title: string;
    description: string;
    items: { q: string; a: string }[];
}

const SUPPORT_TOPICS: SupportTopic[] = [
    {
        icon: Truck,
        title: "Shipping & Delivery",
        description: "Delivery zones, shipping times, and tracking info",
        items: [
            {
                q: "How long does shipping take?",
                a: "Same-day delivery to Tyendinaga, Belleville, and Deseronto (order before 4 PM). Next-day delivery to Toronto GTA, Hamilton, and Brantford. Canada-wide via Xpresspost in 2-5 business days.",
            },
            {
                q: "Is shipping discreet?",
                a: "Absolutely. All orders ship in plain, unmarked packaging with no indication of contents. Your privacy is our priority.",
            },
            {
                q: "How do I track my order?",
                a: "Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account dashboard.",
            },
            {
                q: "Do you offer free shipping?",
                a: "Orders over $150 CAD qualify for free Canada-wide shipping. Local delivery is always free within our same-day zones.",
            },
        ],
    },
    {
        icon: CreditCard,
        title: "Payments & Billing",
        description: "Payment methods, billing questions, and refunds",
        items: [
            {
                q: "What payment methods do you accept?",
                a: "We accept Google Pay, Interac e-Transfer, Visa, Mastercard, and American Express. All payments are processed securely through Stripe.",
            },
            {
                q: "Is my payment information secure?",
                a: "Yes. We use Stripe for payment processing with bank-level encryption. We never store your card details on our servers.",
            },
            {
                q: "How do refunds work?",
                a: "Refunds are processed within 5-7 business days back to your original payment method. Contact us within 48 hours of receiving your order if there's an issue.",
            },
        ],
    },
    {
        icon: Package,
        title: "Orders & Returns",
        description: "Order management, cancellations, and return policy",
        items: [
            {
                q: "Can I cancel or modify my order?",
                a: "Orders can be modified or cancelled within 1 hour of placement, before they enter processing. Contact us immediately at info@mohawkmedibles.ca or call (613) 396-6728.",
            },
            {
                q: "What is your return policy?",
                a: "We accept returns on unopened, sealed products within 14 days of delivery. Products must be in original packaging. Contact support to initiate a return.",
            },
            {
                q: "My order arrived damaged — what do I do?",
                a: "We're sorry about that! Take photos of the damaged items and packaging, then contact us within 48 hours. We'll send a replacement or issue a full refund — your choice.",
            },
        ],
    },
    {
        icon: ShieldCheck,
        title: "Safety & Quality",
        description: "Product quality, lab testing, and dosing guidance",
        items: [
            {
                q: "Are your products lab-tested?",
                a: "Yes. All products meet our Empire Standard quality benchmark and are lab-tested for potency, pesticides, heavy metals, and microbial contaminants.",
            },
            {
                q: "What's the recommended dosage for edibles?",
                a: "Start low, go slow. We recommend beginning with 5-10mg THC and waiting at least 2 hours before consuming more. Edibles take longer to kick in than smoking or vaping.",
            },
            {
                q: "Do I need to be 19+ to order?",
                a: "Yes. You must be 19 years or older to purchase cannabis products. We verify age on all orders — no exceptions.",
            },
        ],
    },
];

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
        <main className="min-h-screen bg-cream dark:bg-forest">
            {/* Hero */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-forest to-forest/95 text-cream">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
                        How Can We Help?
                    </h1>
                    <p className="text-lg text-cream/85 max-w-2xl mx-auto mb-8">
                        Find answers to common questions, or reach out directly.
                        Our team and AI assistant are here to help.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for help — e.g. 'shipping', 'refund', 'dosage'..."
                            className="w-full pl-12 pr-4 py-4 rounded-full bg-card text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 shadow-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Contact Cards */}
            <section className="py-10 bg-cream dark:bg-forest border-b border-border">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-5 bg-white dark:bg-card border border-border rounded-xl hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-forest dark:text-cream text-sm">Live AI Chat</div>
                                <div className="text-xs text-muted-foreground">Click the chat bubble — available 24/7</div>
                            </div>
                        </div>
                        <a
                            href="mailto:info@mohawkmedibles.ca"
                            className="flex items-center gap-4 p-5 bg-white dark:bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                        >
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-forest dark:text-cream text-sm">Email Us</div>
                                <div className="text-xs text-muted-foreground">info@mohawkmedibles.ca — 24hr response</div>
                            </div>
                        </a>
                        <a
                            href="tel:+16133966728"
                            className="flex items-center gap-4 p-5 bg-white dark:bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                        >
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-forest dark:text-cream text-sm">Call Us</div>
                                <div className="text-xs text-muted-foreground">(613) 396-6728 — Mon-Fri 10AM-6PM ET</div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* Support Topics */}
            <section className="py-12 bg-cream dark:bg-forest">
                <div className="max-w-5xl mx-auto px-4">
                    {filteredTopics.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground mb-2">No results for &ldquo;{searchQuery}&rdquo;</p>
                            <p className="text-sm text-muted-foreground/70">Try different keywords, or chat with MedAgent for instant help.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredTopics.map((topic) => (
                                <div
                                    key={topic.title}
                                    className="bg-white dark:bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <topic.icon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-forest dark:text-cream">{topic.title}</h2>
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
            <section className="py-12 bg-white dark:bg-forest/80 border-t border-border">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-forest dark:text-cream mb-6 text-center font-serif">
                        Visit Us
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            <div>
                                <div className="font-semibold text-forest dark:text-cream text-sm">Location</div>
                                <div className="text-sm text-muted-foreground">
                                    45 Dundas Street<br />
                                    Deseronto, ON<br />
                                    Tyendinaga Mohawk Territory
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            <div>
                                <div className="font-semibold text-forest dark:text-cream text-sm">Hours</div>
                                <div className="text-sm text-muted-foreground">
                                    Open 7 Days a Week<br />
                                    10:00 AM – 10:00 PM ET<br />
                                    Same-day orders before 4 PM
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-b from-cream to-white dark:from-forest dark:to-forest/80">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-forest dark:text-cream mb-4 font-serif">
                        Still Need Help?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Our MedAgent AI is available 24/7 to answer questions, help you
                        find products, and guide you through checkout.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/faq"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-card border border-border text-forest dark:text-cream font-semibold rounded-full hover:shadow-md transition-all"
                        >
                            Browse Full FAQ
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full transition-all hover:scale-105 shadow-lg"
                        >
                            Contact Us Directly
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
