import type { Metadata } from "next";
import { Poppins, Albert_Sans } from "next/font/google";
import "@/lib/env-check";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// ─── SEO: Full Metadata (Open Graph + Twitter + AEO) ────────

export const metadata: Metadata = {
  title: {
    default: "Mohawk Medibles | Premium Indigenous Cannabis — Six Nations",
    template: "%s | Mohawk Medibles",
  },
  description:
    "Indigenous-owned premium cannabis dispensary on Six Nations territory. 363+ lab-tested products: flower, edibles, concentrates, vapes. Empire Standard™ quality. Ships Canada-wide.",
  keywords: [
    "mohawk medibles", "indigenous cannabis", "six nations dispensary",
    "buy weed online canada", "premium cannabis ontario",
    "lab tested cannabis", "cannabis edibles", "cannabis delivery canada",
    "terpene profile", "empire standard cannabis",
  ],
  metadataBase: new URL("https://mohawkmedibles.ca"),
  alternates: { canonical: "https://mohawkmedibles.ca" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Open Graph ──────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://mohawkmedibles.ca",
    siteName: "Mohawk Medibles",
    title: "Mohawk Medibles | Premium Indigenous Cannabis — Six Nations",
    description:
      "Indigenous-owned premium cannabis dispensary. 363+ lab-tested products meeting the Empire Standard™. Ships Canada-wide via Xpresspost.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mohawk Medibles — Premium Indigenous Cannabis on Six Nations Territory",
        type: "image/jpeg",
      },
    ],
  },

  // ── Twitter / X Card ───────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@mohawkmedibles",
    creator: "@mohawkmedibles",
    title: "Mohawk Medibles | Premium Indigenous Cannabis",
    description:
      "363+ lab-tested cannabis products. Flower, edibles, concentrates, vapes. Empire Standard™ quality. Ships Canada-wide.",
    images: ["/og-image.png"],
  },

  // ── Verification ───────────────────────────────────────
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },

  // ── Category ───────────────────────────────────────────
  category: "Cannabis Dispensary",

  other: {
    "ai:brand": "Mohawk Medibles",
    "ai:expertise": "Cannabis, Terpenes, THC, CBD, Indigenous Heritage",
    "ai:location": "Six Nations of the Grand River, Ontario, Canada",
  },
};


// ─── SEO: JSON-LD Structured Data ───────────────────────────

import { organizationSchema, localBusinessSchema, websiteSchema, faqSchema } from "@/lib/seo/schemas";
import { getFAQsForSchema } from "@/lib/seo/aeo";

const jsonLdSchemas = [
  organizationSchema(),
  localBusinessSchema(),
  websiteSchema(),
  faqSchema(getFAQsForSchema(undefined, 8)),
];

// ─── Components ─────────────────────────────────────────────

import AgentChatWidget from "@/components/AgentChatWidget";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { Analytics } from "@/components/Analytics";
import ConsentBanner from "@/components/ConsentBanner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import { LocaleProvider } from "@/components/LocaleProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* LLM Discovery */}
        <link rel="alternate" type="text/plain" href="/llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" />
        {/* Hreflang — Multi-lingual */}
        <link rel="alternate" hrefLang="en" href="https://mohawkmedibles.ca" />
        <link rel="alternate" hrefLang="fr" href="https://mohawkmedibles.ca" />
        <link rel="alternate" hrefLang="x-default" href="https://mohawkmedibles.ca" />
      </head>
      <body
        className={`${poppins.className} ${poppins.variable} ${albertSans.variable} antialiased`}
      >
        {/* Multi-schema JSON-LD injection */}
        {jsonLdSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <ThemeProvider>
          <LocaleProvider>
            <CartProvider>
            <WishlistProvider>
              {/* Skip to main content — AODA accessibility requirement */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-bold focus:shadow-lg"
              >
                Skip to main content
              </a>
              <Header />
              <main id="main-content">
                {children}
              </main>
              <Footer />
              <AgentChatWidget />
              <ConsentBanner />
            </WishlistProvider>
            </CartProvider>
          </LocaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
