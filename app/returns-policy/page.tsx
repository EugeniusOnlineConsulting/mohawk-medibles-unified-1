/**
 * Returns & Refund Policy — Mohawk Medibles
 */
import type { Metadata } from "next";
import ReturnsPolicyClient from "./ReturnsPolicyClient";

export const metadata: Metadata = {
    title: "Returns & Refund Policy | Mohawk Medibles — Satisfaction Guarantee",
    description:
        "Mohawk Medibles return and refund policy. Report damaged or incorrect items within 48 hours for full replacement or refund. Customer satisfaction guarantee.",
    keywords: [
        "mohawk medibles returns",
        "cannabis return policy",
        "dispensary refund policy",
        "online dispensary returns canada",
        "cannabis satisfaction guarantee",
    ],
    openGraph: {
        title: "Returns & Refund Policy | Mohawk Medibles",
        description: "Report issues within 48 hours for full replacement or refund. Customer satisfaction guarantee.",
        url: "https://mohawkmedibles.co/returns-policy",
        type: "website",
    },
    alternates: { canonical: "https://mohawkmedibles.co/returns-policy" },
};

export default function ReturnsPolicy() {
    return <ReturnsPolicyClient />;
}
