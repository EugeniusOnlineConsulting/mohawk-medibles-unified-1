"use client";

/**
 * DeliveryMapLoader — Dynamic import wrapper for Leaflet map
 * Prevents SSR since Leaflet requires window/document.
 */

import dynamic from "next/dynamic";
import type { MapCity } from "./DeliveryMap";

const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] w-full rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
            <div className="text-cream/50 text-sm">Loading delivery map...</div>
        </div>
    ),
});

interface DeliveryMapLoaderProps {
    cities: MapCity[];
    center?: [number, number];
    zoom?: number;
    heightClass?: string;
}

export default function DeliveryMapLoader(props: DeliveryMapLoaderProps) {
    return <DeliveryMap {...props} />;
}
