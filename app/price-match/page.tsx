import type { Metadata } from "next";
import PriceMatchClient from "./PriceMatchClient";

export const metadata: Metadata = {
  title: "Lowest Price Guarantee | Price Match + 5% Off | Mohawk Medibles",
  description:
    "Found cannabis cheaper elsewhere? We'll match any Canadian competitor's price and beat it by 5%. Submit your price match request and save even more at Mohawk Medibles.",
  openGraph: {
    title: "Lowest Price Guarantee | Price Match + 5% Off",
    description:
      "We'll match any Canadian competitor's price and beat it by 5%. Premium cannabis at the lowest price guaranteed.",
    url: "https://mohawkmedibles.ca/price-match",
  },
};

export default function PriceMatchPage() {
  return <PriceMatchClient />;
}
