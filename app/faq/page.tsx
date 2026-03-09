/**
 * FAQ — Mohawk Medibles
 * Frequently asked questions with expandable sections.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, MessageSquare } from "lucide-react";

interface FaqItem {
    q: string;
    a: string;
}

interface FaqSection {
    title: string;
    items: FaqItem[];
}

const FAQ_DATA: FaqSection[] = [
    {
        title: "Ordering & Payment",
        items: [
            {
                q: "How do I place an order?",
                a: "Browse our shop, add items to your cart, and proceed to checkout. We accept Visa, Mastercard, Interac e-Transfer, and Bitcoin. All orders are processed securely through Stripe.",
            },
            {
                q: "Is there a minimum order amount?",
                a: "No minimum order required! However, orders over $150 CAD qualify for FREE shipping Canada-wide.",
            },
            {
                q: "Do you charge tax?",
                a: "Ontario HST (13%) applies to all orders. The tax is calculated automatically at checkout and shown in your order summary before payment.",
            },
            {
                q: "Can I modify or cancel my order?",
                a: "Orders can be modified or cancelled within 1 hour of placement, before they enter processing. Contact us immediately at info@mohawkmedibles.ca or call (613) 396-6728.",
            },
            {
                q: "Do you offer wholesale or bulk pricing?",
                a: "Yes! We offer bulk pricing for qualified retailers and dispensaries. Contact our wholesale team at wholesale@mohawkmedibles.ca for pricing and minimum order requirements.",
            },
        ],
    },
    {
        title: "Shipping & Delivery",
        items: [
            {
                q: "Where do you ship?",
                a: "We ship Canada-wide to all 13 provinces and territories via Canada Post Xpresspost. Local delivery is available for Hamilton, Brantford, and the Six Nations area.",
            },
            {
                q: "How long does shipping take?",
                a: "Local delivery: Same day or next day. Ontario: 1-3 business days. Quebec/Maritimes: 2-4 business days. Western Canada: 3-5 business days. Northern Canada: 5-10 business days.",
            },
            {
                q: "How much does shipping cost?",
                a: "FREE for local delivery and orders over $150. Ontario: $15. Quebec/Maritimes: $18. Western Canada: $20. Northern territories: $25. All prices in CAD.",
            },
            {
                q: "Is the packaging discreet?",
                a: "Absolutely. All orders ship in plain, unbranded boxes with no indication of contents. The return address shows a generic business name. Products are vacuum-sealed for freshness and odour control.",
            },
            {
                q: "Will I need to show ID on delivery?",
                a: "Canada Post may require age verification and a signature upon delivery. Please have valid government-issued photo ID confirming you are 19+ available when your package arrives.",
            },
            {
                q: "How do I track my order?",
                a: "Once shipped, you'll receive an email with a Canada Post tracking number. You can also track your order from your account dashboard or ask MedAgent for real-time status updates.",
            },
        ],
    },
    {
        title: "Products & Quality",
        items: [
            {
                q: "Are your products lab-tested?",
                a: "Yes. All products meet our Empire Standard\u2122 quality benchmarks. We work with certified labs to verify THC/CBD content, check for contaminants, and ensure consistent potency across batches.",
            },
            {
                q: "What product categories do you carry?",
                a: "We carry 339+ products across five categories: Premium Flower, Artisan Edibles, Pure Concentrates, Elite Vapes, and Accessories. Our catalogue is updated regularly with new arrivals.",
            },
            {
                q: "Do THC percentages vary between batches?",
                a: "Yes, slight natural variation between batches is normal. The THC/CBD percentages listed on product pages represent the range for the most recent batch. Lab results are available upon request.",
            },
            {
                q: "How should I store my products?",
                a: "Store flower and edibles in a cool, dark place away from direct sunlight. Concentrates should be refrigerated for optimal consistency. Vape cartridges should be stored upright at room temperature.",
            },
        ],
    },
    {
        title: "Returns & Refunds",
        items: [
            {
                q: "What is your return policy?",
                a: "Due to the nature of cannabis products, returns are accepted only for damaged, defective, or incorrectly shipped items. Report issues within 48 hours of delivery with photos to returns@mohawkmedibles.ca.",
            },
            {
                q: "How long do refunds take?",
                a: "Once a return is approved, refunds are processed within 5-10 business days to your original payment method. You'll receive an email confirmation when the refund is issued.",
            },
            {
                q: "What if my package is lost?",
                a: "Contact us within 48 hours of the expected delivery date. We'll work with Canada Post to investigate and either locate the package or arrange a replacement at no additional cost.",
            },
        ],
    },
    {
        title: "Account & Privacy",
        items: [
            {
                q: "Do I need an account to order?",
                a: "No — you can checkout as a guest. However, creating an account lets you track orders, save addresses, and access exclusive subscriber perks.",
            },
            {
                q: "How is my data protected?",
                a: "All data is encrypted in transit (TLS) and at rest. Payment processing is handled by Stripe (PCI-DSS Level 1 compliant). We never store full credit card numbers. See our Privacy Policy for details.",
            },
            {
                q: "What is MedAgent?",
                a: "MedAgent is our AI-powered customer assistant. It can help you find products, track orders, answer questions, and provide general cannabis information. Click the chat icon on any page to start a conversation. MedAgent does not provide medical advice.",
            },
        ],
    },
];

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

    const filteredSections = FAQ_DATA.map((section) => ({
        ...section,
        items: section.items.filter(
            (item) =>
                item.q.toLowerCase().includes(search.toLowerCase()) ||
                item.a.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter((section) => section.items.length > 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="pt-24 pb-8">
                <div className="max-w-3xl mx-auto px-6">
                    <p className="text-sm uppercase tracking-widest text-green-600 dark:text-green-400 font-bold mb-4">Support</p>
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Find answers to common questions about ordering, shipping, products, and more.
                    </p>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card focus:ring-2 focus:ring-forest/30 outline-none transition text-foreground"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="pb-20">
                <div className="max-w-3xl mx-auto px-6 space-y-8">
                    {filteredSections.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                No results found for &ldquo;{search}&rdquo;
                            </p>
                            <p className="text-sm text-muted-foreground/60">
                                Try a different search term, or{" "}
                                <Link href="/contact" className="text-green-600 dark:text-green-400 underline">
                                    contact us
                                </Link>{" "}
                                for help.
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
                        <h3 className="text-lg font-bold text-foreground mb-2">Still have questions?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Our team is ready to help. Reach out via chat, email, or phone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link
                                href="/contact"
                                className="inline-block bg-forest text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-forest/90 transition-colors"
                            >
                                Contact Us
                            </Link>
                            <a
                                href="mailto:info@mohawkmedibles.ca"
                                className="inline-block border border-forest text-forest dark:text-leaf dark:border-leaf px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-forest/5 transition-colors"
                            >
                                Email Support
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
