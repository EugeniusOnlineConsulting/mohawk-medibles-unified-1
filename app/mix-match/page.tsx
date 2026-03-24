import type { Metadata } from "next";
import MixMatchClient from "./MixMatchClient";

export const metadata: Metadata = {
    title: "Build Your Own Ounce — Mix & Match Custom Bundles",
    description:
        "Mix your favorite cannabis strains and save up to 20%! Build custom half ounces, full ounces, or double ounces at Mohawk Medibles. Indigenous-owned dispensary, Canada-wide shipping.",
    keywords: [
        "build your own ounce",
        "mix and match cannabis",
        "custom ounce canada",
        "bulk cannabis canada",
        "mix match weed",
        "cannabis bundle deals",
        "cheap ounces canada",
        "mohawk medibles bundles",
        "dispensary bulk savings",
        "custom cannabis bundle",
    ],
    openGraph: {
        title: "Build Your Own Ounce — Mix & Match",
        description:
            "Mix your favorite strains and save up to 20% with custom ounce bundles at Mohawk Medibles.",
        url: "https://mohawkmedibles.ca/mix-match",
        type: "website",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/mix-match",
    },
};

export default function MixMatchPage() {
    return <MixMatchClient />;
}
