import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rewards Program — Earn Points on Every Purchase",
    description:
        "Join the Mohawk Medibles rewards program. Earn points on every order, unlock exclusive discounts, free products, and VIP perks. Free to join.",
    robots: { index: true, follow: true },
};

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
