"use client";

import Link from "next/link";
import { MapPin, Clock, Phone, ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StorePromo() {
    return (
        <section className="py-16 px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl">
                <div className="bg-gradient-to-br from-forest/5 via-transparent to-leaf/5 dark:from-forest/10 dark:to-leaf/10 rounded-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Map embed */}
                        <div className="h-64 md:h-full min-h-[300px] relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2862.5!2d-77.0833!3d44.2167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDEzJzAwLjAiTiA3N8KwMDUnMDAuMCJX!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mohawk Medibles Store Location"
                                className="absolute inset-0"
                            />
                        </div>

                        {/* Store info */}
                        <div className="p-8 md:p-10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <Store className="h-5 w-5 text-forest dark:text-leaf" />
                                <span className="text-xs font-bold uppercase tracking-widest text-forest dark:text-leaf">
                                    Visit Our Store
                                </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-bold text-forest dark:text-cream mb-3">
                                Mohawk Medibles
                            </h2>

                            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                Order online, pick up in store — skip the wait! Visit our location in
                                Tyendinaga Mohawk Territory for an in-person shopping experience.
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-forest dark:text-leaf mt-0.5 flex-shrink-0" />
                                    <span className="text-foreground">
                                        1738 York Road, Tyendinaga Mohawk Territory, ON K0K 3A0
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-forest dark:text-leaf flex-shrink-0" />
                                    <span className="text-foreground">Open Daily: 9AM - 9PM</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-forest dark:text-leaf flex-shrink-0" />
                                    <a href="tel:+16133961738" className="text-foreground hover:text-forest dark:hover:text-leaf transition-colors">
                                        (613) 396-1738
                                    </a>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link href="/locations">
                                    <Button variant="brand" className="gap-2">
                                        Learn More <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <a
                                    href="https://www.google.com/maps/dir/?api=1&destination=1738+York+Road+Tyendinaga+Mohawk+Territory+ON+K0K+3A0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" className="gap-2">
                                        Get Directions <MapPin className="h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
