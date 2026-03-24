import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Mohawk Medibles — Premium Indigenous Cannabis",
        short_name: "Mohawk Medibles",
        description:
            "Shop 344+ lab-tested cannabis products from Canada's trusted Indigenous-owned dispensary. Free shipping over $149.",
        start_url: "/",
        display: "standalone",
        background_color: "#1e1e26",
        theme_color: "#C8E63E",
        orientation: "portrait-primary",
        categories: ["shopping", "health"],
        icons: [
            {
                src: "/favicon.ico",
                sizes: "48x48",
                type: "image/x-icon",
            },
            {
                src: "/assets/logos/medibles-logo.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/assets/logos/medibles-logo.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
