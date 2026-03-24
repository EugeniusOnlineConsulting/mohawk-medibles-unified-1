"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Truck, Clock, Phone, Navigation, Store } from "lucide-react";

export type DeliveryMethod = "ship" | "pickup";

interface ClickAndCollectProps {
    onMethodChange: (method: DeliveryMethod) => void;
    onPickupTimeChange?: (time: string) => void;
    defaultMethod?: DeliveryMethod;
}

const STORE_INFO = {
    name: "Mohawk Medibles",
    address: "1738 York Road, Tyendinaga Mohawk Territory, ON K0K 3A0",
    phone: "(613) 396-1738",
    hours: "Mon-Sun 9AM-9PM",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=1738+York+Road+Tyendinaga+Mohawk+Territory+ON+K0K+3A0",
};

// Generate pickup time slots (30-min intervals from 9AM to 8:30PM)
function generatePickupSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 9; hour < 21; hour++) {
        for (const min of [0, 30]) {
            if (hour === 20 && min === 30) continue; // Last slot is 8:30PM
            const h = hour > 12 ? hour - 12 : hour;
            const ampm = hour >= 12 ? "PM" : "AM";
            const m = min === 0 ? "00" : "30";
            slots.push(`${h}:${m} ${ampm}`);
        }
    }
    return slots;
}

const PICKUP_SLOTS = generatePickupSlots();

export default function ClickAndCollect({ onMethodChange, onPickupTimeChange, defaultMethod }: ClickAndCollectProps) {
    const [method, setMethod] = useState<DeliveryMethod>(defaultMethod || "ship");
    const [pickupTime, setPickupTime] = useState(PICKUP_SLOTS[2] || "10:00 AM"); // Default to 10 AM

    // Load saved preference from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("mm-delivery-method");
            if (saved === "pickup" || saved === "ship") {
                setMethod(saved);
                onMethodChange(saved);
            }
        } catch { /* ignore */ }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function handleMethodChange(newMethod: DeliveryMethod) {
        setMethod(newMethod);
        onMethodChange(newMethod);
        try {
            localStorage.setItem("mm-delivery-method", newMethod);
        } catch { /* ignore */ }
    }

    function handleTimeChange(time: string) {
        setPickupTime(time);
        onPickupTimeChange?.(time);
    }

    return (
        <div className="space-y-4">
            {/* Method toggle */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleMethodChange("ship")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        method === "ship"
                            ? "border-forest bg-forest/5 dark:border-leaf dark:bg-leaf/10"
                            : "border-border hover:border-forest/30 dark:hover:border-leaf/30"
                    }`}
                >
                    <div className={`p-2 rounded-lg ${
                        method === "ship"
                            ? "bg-forest text-white dark:bg-leaf"
                            : "bg-muted text-muted-foreground"
                    }`}>
                        <Truck className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-sm">Ship to Me</div>
                        <div className="text-xs text-muted-foreground">Canada Post Xpresspost</div>
                    </div>
                </button>

                <button
                    onClick={() => handleMethodChange("pickup")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        method === "pickup"
                            ? "border-forest bg-forest/5 dark:border-leaf dark:bg-leaf/10"
                            : "border-border hover:border-forest/30 dark:hover:border-leaf/30"
                    }`}
                >
                    <div className={`p-2 rounded-lg ${
                        method === "pickup"
                            ? "bg-forest text-white dark:bg-leaf"
                            : "bg-muted text-muted-foreground"
                    }`}>
                        <Store className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-sm">Pick Up in Store</div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">FREE — No shipping</div>
                    </div>
                </button>
            </div>

            {/* Pickup details */}
            <AnimatePresence>
                {method === "pickup" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-forest/5 dark:bg-leaf/5 border border-forest/20 dark:border-leaf/20 rounded-xl p-5 space-y-4">
                            {/* Store info */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-forest dark:text-cream text-sm">Pickup Location</h3>
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 text-forest dark:text-leaf mt-0.5 flex-shrink-0" />
                                    <span>{STORE_INFO.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 text-forest dark:text-leaf flex-shrink-0" />
                                    <span>{STORE_INFO.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 text-forest dark:text-leaf flex-shrink-0" />
                                    <span>{STORE_INFO.hours}</span>
                                </div>
                            </div>

                            {/* Pickup time selector */}
                            <div>
                                <label className="block text-sm font-medium text-forest dark:text-cream mb-2">
                                    Select Pickup Time
                                </label>
                                <select
                                    value={pickupTime}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-white dark:bg-card focus:ring-2 focus:ring-forest/30 outline-none transition"
                                >
                                    {PICKUP_SLOTS.map((slot) => (
                                        <option key={slot} value={slot}>Today — {slot}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Your order will be ready for pickup at <strong>{pickupTime}</strong>
                                </p>
                            </div>

                            {/* Get directions button */}
                            <a
                                href={STORE_INFO.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-forest dark:text-leaf hover:underline"
                            >
                                <Navigation className="h-4 w-4" />
                                Get Directions
                            </a>

                            {/* Reminder */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-3 rounded-lg text-xs">
                                Bring a valid ID for age verification when picking up your order.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
