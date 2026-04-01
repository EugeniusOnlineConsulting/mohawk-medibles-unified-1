"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    MapPin, Clock, Phone, Navigation, Store, Shield,
    ShoppingBag, Car, Leaf, Star, CheckCircle, ArrowRight, Camera,
} from "lucide-react";

const STORE = {
    name: "Mohawk Medibles",
    address: "1738 York Road, Tyendinaga Mohawk Territory, ON K0K 3A0",
    phone: "(613) 396-1738",
    phoneTel: "+16133961738",
    hours: [
        { day: "Monday", time: "9:00 AM - 9:00 PM" },
        { day: "Tuesday", time: "9:00 AM - 9:00 PM" },
        { day: "Wednesday", time: "9:00 AM - 9:00 PM" },
        { day: "Thursday", time: "9:00 AM - 9:00 PM" },
        { day: "Friday", time: "9:00 AM - 9:00 PM" },
        { day: "Saturday", time: "9:00 AM - 9:00 PM" },
        { day: "Sunday", time: "9:00 AM - 9:00 PM" },
    ],
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Mohawk+Medibles&destination_place_id=ChIJUa3RTdDW14kRUbQUjhh1AWg",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2862.5!2d-77.0635744!3d44.1967697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d7d6d04dd1ad51%3A0x680175188e14b451!2sMohawk%20Medibles!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca",
};

const WHAT_TO_EXPECT = [
    {
        icon: Shield,
        title: "Valid ID Required",
        description: "Bring government-issued photo ID. You must be 19+ to enter and purchase.",
    },
    {
        icon: Leaf,
        title: "Full Product Selection",
        description: "Browse our entire collection of flower, edibles, concentrates, vapes, pre-rolls, and more.",
    },
    {
        icon: Star,
        title: "Expert Staff",
        description: "Our knowledgeable budtenders can help you find the perfect product for your needs.",
    },
    {
        icon: ShoppingBag,
        title: "Click & Collect",
        description: "Order online and pick up in store. Your order will be ready when you arrive.",
    },
    {
        icon: Car,
        title: "Free Parking",
        description: "Ample free parking right in front of our store. Easy in, easy out.",
    },
    {
        icon: CheckCircle,
        title: "Cash & Card Accepted",
        description: "We accept cash, Visa, Mastercard, and Interac debit for in-store purchases.",
    },
];

const LANDMARKS = [
    "Located on York Road (Highway 2) in Tyendinaga Mohawk Territory",
    "Between Belleville and Napanee, just off the 401",
    "10 minutes east of Belleville, 15 minutes west of Napanee",
    "Look for the Mohawk Medibles sign on the south side of York Road",
];

export default function LocationsClient() {
    const today = new Date().getDay(); // 0=Sun, 1=Mon...
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0 index

    return (
        <div className="min-h-screen page-glass pt-20">
            {/* Hero with map */}
            <section className="relative">
                <div className="h-[400px] md:h-[500px] relative">
                    <iframe
                        src={STORE.embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mohawk Medibles Location Map"
                        className="absolute inset-0"
                    />
                    {/* Overlay with store name */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-10">
                        <div className="container mx-auto max-w-5xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Store className="h-5 w-5 text-lime" />
                                <span className="text-xs font-bold uppercase tracking-widest text-lime">
                                    Visit Us
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Mohawk Medibles
                            </h1>
                            <p className="text-white/80 text-sm md:text-base max-w-xl">
                                Indigenous-owned cannabis dispensary in Tyendinaga Mohawk Territory.
                                Shop in-person or order online for pickup.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-12">
                {/* Store Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-card rounded-2xl shadow-xl -mt-16 relative z-10 p-6 md:p-8 mb-12"
                >
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Address & Contact */}
                        <div className="space-y-4">
                            <h2 className="font-bold text-lg text-forest dark:text-cream">Location</h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-forest dark:text-leaf mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">{STORE.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-forest dark:text-leaf flex-shrink-0" />
                                    <a href={`tel:${STORE.phoneTel}`} className="font-medium text-foreground hover:text-forest dark:hover:text-leaf transition-colors">
                                        {STORE.phone}
                                    </a>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="brand" size="sm" className="gap-2">
                                        <Navigation className="h-4 w-4" /> Get Directions
                                    </Button>
                                </a>
                                <a href={`tel:${STORE.phoneTel}`}>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Phone className="h-4 w-4" /> Call Now
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="space-y-4">
                            <h2 className="font-bold text-lg text-forest dark:text-cream">Hours</h2>
                            <div className="space-y-1.5">
                                {STORE.hours.map((h, i) => (
                                    <div
                                        key={h.day}
                                        className={`flex justify-between text-sm py-1.5 px-3 rounded-lg ${
                                            i === todayIndex
                                                ? "bg-forest/10 dark:bg-leaf/10 font-bold text-forest dark:text-leaf"
                                                : "text-foreground"
                                        }`}
                                    >
                                        <span>{h.day}</span>
                                        <span>{h.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Click & Collect CTA */}
                        <div className="space-y-4">
                            <h2 className="font-bold text-lg text-forest dark:text-cream">Click & Collect</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Order online and skip the wait. Choose &ldquo;Pick up in store&rdquo; at checkout
                                and your order will be ready when you arrive.
                            </p>
                            <div className="space-y-2">
                                <Link href="/shop">
                                    <Button variant="brand" className="w-full gap-2">
                                        <ShoppingBag className="h-4 w-4" /> Shop Now
                                    </Button>
                                </Link>
                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                                    Free pickup — no shipping cost
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Store Photos */}
                <section className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Camera className="h-5 w-5 text-forest dark:text-lime" />
                            <h2 className="text-2xl font-bold text-forest dark:text-cream">
                                Our Store
                            </h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Take a look inside Mohawk Medibles — Tyendinaga Mohawk Territory&apos;s premier cannabis dispensary.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                        >
                            <Image
                                src="/assets/store/exterior-night.jpg"
                                alt="Mohawk Medibles storefront at night with illuminated MEDIBLES sign in Deseronto, Ontario"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <p className="text-white font-bold text-sm">Storefront — Tyendinaga Mohawk Territory</p>
                                <p className="text-white/70 text-xs">Open daily 9 AM – 9 PM</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                        >
                            <Image
                                src="/assets/store/interior.jpg"
                                alt="Inside Mohawk Medibles — full product selection of cannabis flower, edibles, vapes, and accessories"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <p className="text-white font-bold text-sm">Inside — 344+ Products</p>
                                <p className="text-white/70 text-xs">Flower, edibles, concentrates, vapes &amp; more</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* What to Expect */}
                <section className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold text-forest dark:text-cream mb-2">
                            What to Expect When You Visit
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Everything you need to know before your first visit.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {WHAT_TO_EXPECT.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-leaf/10 flex items-center justify-center mb-3">
                                    <item.icon className="h-5 w-5 text-forest dark:text-leaf" />
                                </div>
                                <h3 className="font-bold text-forest dark:text-cream mb-1">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* How to Find Us */}
                <section className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold text-forest dark:text-cream mb-2">
                            How to Find Us
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Nearby landmarks and directions.
                        </p>
                    </motion.div>

                    <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm space-y-3">
                        {LANDMARKS.map((landmark, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-forest/10 dark:bg-leaf/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-forest dark:text-leaf">{i + 1}</span>
                                </div>
                                <p className="text-sm text-foreground">{landmark}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold text-forest dark:text-cream mb-3">
                            Ready to Shop?
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Browse our full collection online or visit us in person. Either way,
                            you are getting premium cannabis at the best prices in Canada.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/shop">
                                <Button variant="brand" size="lg" className="gap-2">
                                    Shop Online <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <Navigation className="h-4 w-4" /> Get Directions
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
}
