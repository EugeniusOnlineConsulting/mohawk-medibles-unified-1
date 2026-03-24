import type { Metadata } from "next";
import LocationsClient from "./LocationsClient";

export const metadata: Metadata = {
    title: "Visit Us — Mohawk Medibles | Tyendinaga Mohawk Territory",
    description:
        "Visit Mohawk Medibles at 1738 York Road, Tyendinaga Mohawk Territory, ON. Open daily 9AM-9PM. Order online for in-store pickup or browse our full selection in person.",
    openGraph: {
        title: "Visit Mohawk Medibles — Tyendinaga Mohawk Territory",
        description:
            "Indigenous-owned cannabis dispensary. Visit us in person or order online for click-and-collect pickup.",
        url: "https://mohawkmedibles.ca/locations",
        type: "website",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/locations",
    },
};

export default function LocationsPage() {
    return <LocationsClient />;
}
