import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contests & Giveaways — Win Free Cannabis Products",
    description:
        "Enter to win free cannabis products, gift cards, and exclusive prizes from Mohawk Medibles. New contests every month — open to all Canadian residents 19+.",
    robots: { index: true, follow: true },
};

export default function ContestsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
