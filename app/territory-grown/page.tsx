import type { Metadata } from "next";
import TerritoryGrownClient from "./TerritoryGrownClient";

export const metadata: Metadata = {
  title: "Tyendinaga Territory Grown Cannabis | Indigenous Cultivated | Mohawk Medibles",
  description:
    "Shop cannabis proudly cultivated on Tyendinaga Mohawk Territory. Support Indigenous sovereignty, local growers, and community reinvestment. Premium flower, edibles & concentrates.",
  openGraph: {
    title: "Tyendinaga Territory Grown Cannabis | Mohawk Medibles",
    description:
      "Proudly cultivated on Mohawk Territory. Supporting Indigenous sovereignty through cannabis.",
    url: "https://mohawkmedibles.ca/territory-grown",
  },
};

export default function TerritoryGrownPage() {
  return <TerritoryGrownClient />;
}
