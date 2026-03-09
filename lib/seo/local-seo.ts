/**
 * Mohawk Medibles — Local SEO & Service Area Targeting
 * ═════════════════════════════════════════════════════
 * Defines delivery regions with coordinates, local keywords,
 * and generates per-city structured data for local pack ranking.
 */

const BASE_URL = "https://mohawkmedibles.ca";

// ─── Service Area Definitions ───────────────────────────────

export interface ServiceArea {
    slug: string;
    city: string;
    region: string;
    province: string;
    lat: number;
    lng: number;
    radiusKm: number;
    keywords: string[];
    description: string;
    deliveryTime: string;
}

export const SERVICE_AREAS: ServiceArea[] = [
    {
        slug: "six-nations",
        city: "Six Nations of the Grand River",
        region: "Brant County",
        province: "Ontario",
        lat: 43.0667,
        lng: -80.1167,
        radiusKm: 10,
        keywords: [
            "six nations cannabis", "six nations dispensary",
            "indigenous dispensary ohsweken", "cannabis six nations reserve",
        ],
        description: "Local pickup and same-day delivery on Six Nations territory. Our home community.",
        deliveryTime: "Same day",
    },
    {
        slug: "brantford",
        city: "Brantford",
        region: "Brant County",
        province: "Ontario",
        lat: 43.1394,
        lng: -80.2644,
        radiusKm: 15,
        keywords: [
            "cannabis delivery brantford", "weed delivery brantford",
            "dispensary near brantford", "buy cannabis brantford ontario",
        ],
        description: "Premium cannabis delivery to Brantford and surrounding Brant County. Fast, discreet, lab-tested products.",
        deliveryTime: "Same day – Next day",
    },
    {
        slug: "hamilton",
        city: "Hamilton",
        region: "Hamilton-Wentworth",
        province: "Ontario",
        lat: 43.2557,
        lng: -79.8711,
        radiusKm: 25,
        keywords: [
            "cannabis delivery hamilton", "weed delivery hamilton ontario",
            "dispensary hamilton", "buy weed online hamilton",
        ],
        description: "Cannabis delivery to Hamilton, Ancaster, Dundas, and Stoney Creek. Empire Standard™ quality, shipped fast.",
        deliveryTime: "Next day",
    },
    {
        slug: "caledonia",
        city: "Caledonia",
        region: "Haldimand County",
        province: "Ontario",
        lat: 43.0715,
        lng: -79.9531,
        radiusKm: 10,
        keywords: [
            "cannabis delivery caledonia", "dispensary near caledonia",
            "weed delivery haldimand county",
        ],
        description: "Quick cannabis delivery to Caledonia and Haldimand County from Six Nations territory.",
        deliveryTime: "Same day",
    },
    {
        slug: "toronto",
        city: "Toronto",
        region: "Greater Toronto Area",
        province: "Ontario",
        lat: 43.6532,
        lng: -79.3832,
        radiusKm: 40,
        keywords: [
            "cannabis delivery toronto", "weed delivery toronto",
            "buy weed online toronto", "toronto dispensary delivery",
            "cannabis delivery gta",
        ],
        description: "Premium indigenous cannabis delivered to Toronto and the GTA. Lab-tested, terpene-profiled, Empire Standard™.",
        deliveryTime: "1–2 business days",
    },
    {
        slug: "hagersville",
        city: "Hagersville",
        region: "Haldimand County",
        province: "Ontario",
        lat: 42.9564,
        lng: -80.0556,
        radiusKm: 10,
        keywords: [
            "cannabis delivery hagersville", "dispensary near hagersville",
        ],
        description: "Cannabis delivery to Hagersville and surrounding Norfolk/Haldimand area.",
        deliveryTime: "Same day",
    },
];

// ─── Service Area JSON-LD Schema ────────────────────────────

export function serviceAreaSchema(area: ServiceArea) {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${BASE_URL}/delivery/${area.slug}/#service`,
        name: `Cannabis Delivery — ${area.city}`,
        description: area.description,
        provider: { "@id": `${BASE_URL}/#store` },
        areaServed: {
            "@type": "City",
            name: area.city,
            containedInPlace: {
                "@type": "AdministrativeArea",
                name: `${area.region}, ${area.province}, Canada`,
            },
            geo: {
                "@type": "GeoCoordinates",
                latitude: area.lat,
                longitude: area.lng,
            },
        },
        serviceType: "Cannabis Delivery",
        availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: `${BASE_URL}/shop`,
            serviceSmsNumber: undefined,
        },
        offers: {
            "@type": "Offer",
            priceCurrency: "CAD",
            price: "0",
            description: "Free delivery on qualifying orders",
            eligibleRegion: {
                "@type": "GeoCircle",
                geoMidpoint: {
                    "@type": "GeoCoordinates",
                    latitude: area.lat,
                    longitude: area.lng,
                },
                geoRadius: `${area.radiusKm} km`,
            },
        },
    };
}

// ─── Local Landing Page Metadata Generator ──────────────────

export function localLandingPageMetadata(area: ServiceArea) {
    return {
        title: `Cannabis Delivery ${area.city} | Mohawk Medibles`,
        description: `Premium indigenous cannabis delivered to ${area.city}, ${area.province}. ${area.deliveryTime} delivery. 339+ lab-tested products. Empire Standard™ quality.`,
        keywords: area.keywords,
        openGraph: {
            title: `Cannabis Delivery ${area.city} | Mohawk Medibles`,
            description: area.description,
            url: `${BASE_URL}/delivery/${area.slug}`,
            locale: "en_CA",
            type: "website" as const,
        },
    };
}
