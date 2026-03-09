/**
 * About Us — Mohawk Medibles
 * Indigenous-owned cannabis dispensary story page.
 */
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "About Us | Mohawk Medibles — Indigenous-Owned Cannabis Dispensary",
    description:
        "Learn about Mohawk Medibles — an Indigenous-owned cannabis dispensary operating from Six Nations of the Grand River Territory, serving Canada since 2019.",
    openGraph: {
        title: "About Mohawk Medibles",
        description: "Indigenous-owned cannabis dispensary serving Canada with premium products since 2019.",
    },
};

const VALUES = [
    {
        title: "Indigenous Sovereignty",
        description:
            "We operate under the inherent sovereignty of the Haudenosaunee Confederacy and the Mohawk Nation. Our business is rooted in self-determination, community empowerment, and the long tradition of Indigenous trade.",
        icon: "🪶",
    },
    {
        title: "Empire Standard\u2122 Quality",
        description:
            "Every product we carry meets our rigorous Empire Standard\u2122 — lab-tested, properly stored, and carefully curated. We never compromise on potency, purity, or freshness.",
        icon: "🏆",
    },
    {
        title: "Community First",
        description:
            "A significant portion of our revenue flows back into Six Nations community programs, youth initiatives, and cultural preservation. When you shop with us, you support Indigenous communities.",
        icon: "🤝",
    },
    {
        title: "Sustainable Practices",
        description:
            "We prioritize environmentally conscious suppliers, recyclable packaging, and minimal waste operations. Our commitment to the land reflects our deep connection to the natural world.",
        icon: "🌿",
    },
];

const MILESTONES = [
    { year: "2019", event: "Founded on Six Nations of the Grand River Territory" },
    { year: "2020", event: "Expanded to Canada-wide shipping via Canada Post Xpresspost" },
    { year: "2021", event: "Launched premium edibles and concentrates line" },
    { year: "2022", event: "Reached 10,000+ satisfied customers across all provinces" },
    { year: "2023", event: "Introduced the Empire Standard\u2122 quality program" },
    { year: "2024", event: "Launched MedAgent AI-powered customer support" },
    { year: "2025", event: "339+ curated products across 5 categories" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent dark:from-white/5 dark:to-transparent" />
                <div className="max-w-4xl mx-auto px-6 relative">
                    <p className="text-sm uppercase tracking-widest text-green-600 dark:text-green-400 font-bold mb-4">Our Story</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                        Rooted in Sovereignty.<br />Built for Community.
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        Mohawk Medibles is an Indigenous-owned cannabis dispensary operating from
                        Tyendinaga Mohawk Territory and Six Nations of the Grand River, Ontario.
                        Since 2019, we&apos;ve been serving Canadians with premium cannabis products
                        backed by quality, integrity, and respect for Indigenous traditions.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 bg-card">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        To provide Canadians with the highest-quality cannabis products while exercising
                        Indigenous sovereignty and reinvesting in our communities. We believe access to
                        premium, lab-tested cannabis should be simple, affordable, and dignified — with
                        fast shipping, discreet packaging, and knowledgeable support every step of the way.
                    </p>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-foreground mb-10 text-center">What We Stand For</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {VALUES.map((v) => (
                            <div
                                key={v.title}
                                className="bg-card border border-border rounded-xl p-6 space-y-3"
                            >
                                <div className="text-3xl">{v.icon}</div>
                                <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-16 bg-card">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-foreground mb-10 text-center">Our Journey</h2>
                    <div className="space-y-6">
                        {MILESTONES.map((m, i) => (
                            <div key={m.year} className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 text-right">
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{m.year}</span>
                                </div>
                                <div className="relative flex-1 pb-6">
                                    {i < MILESTONES.length - 1 && (
                                        <div className="absolute left-0 top-8 bottom-0 w-px bg-border -translate-x-[11px]" />
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className="w-[6px] h-[6px] rounded-full bg-green-600 dark:bg-green-400 mt-2 flex-shrink-0" />
                                        <p className="text-foreground">{m.event}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Location / Contact */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Visit Us</h2>
                    <p className="text-muted-foreground mb-2">
                        45 Dundas Street, Deseronto, Ontario
                    </p>
                    <p className="text-muted-foreground mb-2">
                        Tyendinaga Mohawk Territory
                    </p>
                    <p className="text-muted-foreground mb-6">(613) 396-6728</p>
                    <div className="flex justify-center gap-4">
                        <a
                            href="/shop"
                            className="inline-block bg-forest text-white px-6 py-3 rounded-lg font-bold hover:bg-forest/90 transition-colors"
                        >
                            Browse Our Collection
                        </a>
                        <a
                            href="/contact"
                            className="inline-block border border-forest text-forest dark:text-leaf dark:border-leaf px-6 py-3 rounded-lg font-bold hover:bg-forest/5 transition-colors"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
