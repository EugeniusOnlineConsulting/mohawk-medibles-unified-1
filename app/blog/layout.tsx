import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cannabis Blog — Guides, Science & Education",
    description:
        "Expert cannabis guides, terpene science, dosing charts, and product education from Mohawk Medibles. Indigenous-owned dispensary sharing 10+ years of cultivation knowledge.",
    openGraph: {
        title: "Cannabis Blog | Mohawk Medibles",
        description:
            "Expert cannabis education: terpene guides, edible dosing, strain comparisons, and more. Science-backed content from Six Nations territory.",
        url: "https://mohawkmedibles.ca/blog",
        type: "website",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/blog",
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
