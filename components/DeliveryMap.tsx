"use client";

/**
 * DeliveryMap — Interactive Leaflet Map of Delivery Coverage
 * ═══════════════════════════════════════════════════════════
 * Shows city markers across Canada with clickable pins that
 * navigate to the city delivery page. Uses Leaflet (free, no API key).
 *
 * Rendered client-side only (dynamic import with ssr:false required).
 */

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapCity {
    name: string;
    provinceName: string;
    provinceSlug: string;
    citySlug: string;
    lat: number;
    lng: number;
    population: string;
    deliveryTime: string;
}

interface DeliveryMapProps {
    cities: MapCity[];
    /** Center the map on a specific coordinate (defaults to Canada center) */
    center?: [number, number];
    /** Initial zoom level (defaults to 4 for full Canada view) */
    zoom?: number;
    /** Map height class (defaults to h-[500px]) */
    heightClass?: string;
}

export default function DeliveryMap({
    cities,
    center = [56.1304, -106.3468],
    zoom = 4,
    heightClass = "h-[500px]",
}: DeliveryMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Create map
        const map = L.map(mapRef.current, {
            center,
            zoom,
            scrollWheelZoom: false,
            zoomControl: true,
        });

        // Dark tile layer matching the forest theme
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        // Custom marker icon matching brand colors
        const markerIcon = L.divIcon({
            className: "custom-delivery-marker",
            html: `<div style="
                width: 12px;
                height: 12px;
                background: #c8a951;
                border: 2px solid #fff;
                border-radius: 50%;
                box-shadow: 0 0 8px rgba(200,169,81,0.6);
            "></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        });

        // Add markers for each city
        cities.forEach((city) => {
            const marker = L.marker([city.lat, city.lng], { icon: markerIcon }).addTo(map);

            marker.bindPopup(
                `<div style="font-family: system-ui; min-width: 160px;">
                    <strong style="font-size: 14px; color: #1a1a2e;">${city.name}</strong>
                    <div style="font-size: 11px; color: #666; margin: 4px 0;">${city.provinceName}</div>
                    <div style="font-size: 11px; color: #444;">Pop: ${city.population}</div>
                    <div style="font-size: 11px; color: #444; margin-bottom: 8px;">Delivery: ${city.deliveryTime}</div>
                    <a href="/delivery/${city.provinceSlug}/${city.citySlug}"
                       style="display: inline-block; padding: 4px 12px; background: #1a3a2a; color: #c8a951;
                              text-decoration: none; border-radius: 4px; font-size: 11px; font-weight: bold;">
                        View Delivery Info →
                    </a>
                </div>`,
                { closeButton: true, className: "delivery-popup" }
            );

            marker.on("click", () => {
                marker.openPopup();
            });
        });

        mapInstance.current = map;

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, [cities, center, zoom, router]);

    return (
        <div
            ref={mapRef}
            className={`${heightClass} w-full rounded-2xl border border-white/10 overflow-hidden`}
            role="img"
            aria-label="Interactive map showing Mohawk Medibles delivery locations across Canada"
        />
    );
}
