import type { Metadata } from "next";
import ShopByMoodClient from "./ShopByMoodClient";

export const metadata: Metadata = {
    title: "Shop by Mood | How Do You Want to Feel? | Mohawk Medibles",
    description:
        "Skip the science. Shop cannabis by the experience you want — Relax, Energize, Balance, Sleep, or Relief. 344+ premium products matched to your mood. Indigenous-owned, Canada-wide shipping.",
    openGraph: {
        title: "Shop by Mood | How Do You Want to Feel?",
        description:
            "Skip the science. Shop cannabis by the experience you want — Relax, Energize, Balance, Sleep, or Relief at Mohawk Medibles.",
        url: "https://mohawkmedibles.ca/shop-by-mood",
        type: "website",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/shop-by-mood",
    },
};

export default function ShopByMoodPage() {
    return <ShopByMoodClient />;
}
