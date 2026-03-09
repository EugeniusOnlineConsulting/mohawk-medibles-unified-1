/**
 * Mohawk Medibles — SEO Schema Generator (JSON-LD)
 * ═════════════════════════════════════════════════
 * Generates rich structured data for all page types.
 * Optimized for Google Rich Results, Perplexity citations,
 * ChatGPT recommendations, and AI search engines.
 */

const BASE_URL = "https://mohawkmedibles.ca";

// ─── Brand Constants ────────────────────────────────────────

const BRAND = {
    name: "Mohawk Medibles",
    legalName: "Mohawk Medibles",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
        "Indigenous-owned premium cannabis dispensary on Six Nations territory. Lab-tested, terpene-profiled products meeting the Empire Standard™.",
    slogan: "The Empire Standard™",
    foundingLocation: "Six Nations of the Grand River, Ontario, Canada",
    sameAs: [
        "https://www.tiktok.com/@mediblesdeseronto",
        "https://x.com/mohawkmedibles",
        "https://www.youtube.com/@MohawkMedibles",
        "https://www.facebook.com/mohawkmediblesofficial",
    ],
    address: {
        "@type": "PostalAddress" as const,
        streetAddress: "Six Nations of the Grand River",
        addressLocality: "Ohsweken",
        addressRegion: "ON",
        postalCode: "N0A 1M0",
        addressCountry: "CA",
    },
    geo: {
        "@type": "GeoCoordinates" as const,
        latitude: 43.0667,
        longitude: -80.1167,
    },
    contactPoint: {
        "@type": "ContactPoint" as const,
        contactType: "customer service",
        email: "support@mohawkmedibles.ca",
        availableLanguage: ["English", "French"],
    },
};

// ─── Organization Schema ────────────────────────────────────

export function organizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: BRAND.name,
        legalName: BRAND.legalName,
        url: BRAND.url,
        logo: {
            "@type": "ImageObject",
            url: BRAND.logo,
            width: 512,
            height: 512,
        },
        description: BRAND.description,
        slogan: BRAND.slogan,
        foundingLocation: BRAND.foundingLocation,
        sameAs: BRAND.sameAs,
        address: BRAND.address,
        contactPoint: BRAND.contactPoint,
        areaServed: {
            "@type": "Country",
            name: "Canada",
        },
        knowsAbout: [
            "Cannabis",
            "Terpenes",
            "THC",
            "CBD",
            "Indica strains",
            "Sativa strains",
            "Cannabis edibles",
            "Cannabis concentrates",
            "Indigenous cannabis culture",
            "Six Nations",
        ],
    };
}

// ─── LocalBusiness Schema (for Google Maps / Local Pack) ────

export function localBusinessSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Store",
        "@id": `${BASE_URL}/#store`,
        name: BRAND.name,
        image: BRAND.logo,
        description: BRAND.description,
        telephone: "+1-555-555-5555",
        address: BRAND.address,
        geo: BRAND.geo,
        url: BRAND.url,
        sameAs: BRAND.sameAs,
        hasMap: "https://maps.google.com/?q=Six+Nations+of+the+Grand+River+Ontario+Canada",
        areaServed: [
            { "@type": "City", name: "Six Nations of the Grand River" },
            { "@type": "City", name: "Brantford" },
            { "@type": "City", name: "Hamilton" },
            { "@type": "City", name: "Toronto" },
            { "@type": "City", name: "Caledonia" },
            { "@type": "City", name: "Hagersville" },
            { "@type": "Country", name: "Canada" },
        ],
        availableLanguage: ["English", "French", "Mohawk"],
        priceRange: "$$",
        currenciesAccepted: "CAD",
        paymentAccepted: "Cash, Credit Card, E-Transfer",
        openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
                "Monday", "Tuesday", "Wednesday", "Thursday",
                "Friday", "Saturday", "Sunday",
            ],
            opens: "09:00",
            closes: "22:00",
        },
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Cannabis Products",
            itemListElement: [
                { "@type": "OfferCatalog", name: "Flower", url: `${BASE_URL}/shop/flower` },
                { "@type": "OfferCatalog", name: "Edibles", url: `${BASE_URL}/shop/edibles` },
                { "@type": "OfferCatalog", name: "Concentrates", url: `${BASE_URL}/shop/concentrates` },
                { "@type": "OfferCatalog", name: "Vapes", url: `${BASE_URL}/shop/vapes` },
                { "@type": "OfferCatalog", name: "Pre-Rolls", url: `${BASE_URL}/shop/pre-rolls` },
            ],
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}

// ─── WebSite Schema (Sitelinks Search Box) ──────────────────

export function websiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: BRAND.name,
        url: BRAND.url,
        description: BRAND.description,
        publisher: { "@id": `${BASE_URL}/#organization` },
        inLanguage: "en-CA",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}

// ─── Product Schema ─────────────────────────────────────────

interface ProductSchemaInput {
    name: string;
    slug: string;
    description: string;
    price: number;
    image: string;
    category: string;
    sku?: string;
    thc?: string;
    cbd?: string;
    weight?: string;
    terpenes?: string[];
    inStock?: boolean;
    rating?: number;
    reviewCount?: number;
}

export function productSchema(product: ProductSchemaInput) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${BASE_URL}/shop/${product.slug}/#product`,
        name: product.name,
        headline: product.name,
        description: product.description,
        speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: [".product-title", ".product-price", ".product-description"],
        },
        image: product.image.startsWith("http")
            ? product.image
            : `${BASE_URL}${product.image}`,
        sku: product.sku || product.slug,
        brand: {
            "@type": "Brand",
            name: "Mohawk Medibles",
        },
        category: product.category,
        offers: {
            "@type": "Offer",
            url: `${BASE_URL}/shop/${product.slug}`,
            priceCurrency: "CAD",
            price: product.price,
            priceValidUntil: new Date(
                Date.now() + 90 * 86400000
            ).toISOString().split("T")[0],
            availability: product.inStock !== false
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: { "@id": `${BASE_URL}/#organization` },
            shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "CA",
                },
                deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "d" },
                    transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "d" },
                },
            },
        },
        ...(product.rating && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviewCount || 1,
                bestRating: 5,
                worstRating: 1,
            },
        }),
        additionalProperty: [
            ...(product.thc ? [{ "@type": "PropertyValue", name: "THC", value: product.thc }] : []),
            ...(product.cbd ? [{ "@type": "PropertyValue", name: "CBD", value: product.cbd }] : []),
            ...(product.weight ? [{ "@type": "PropertyValue", name: "Weight", value: product.weight }] : []),
            ...(product.terpenes?.length ? [{ "@type": "PropertyValue", name: "Terpene Profile", value: product.terpenes.join(", ") }] : []),
        ],
    };
}

// ─── FAQ Schema ─────────────────────────────────────────────

interface FAQItem {
    question: string;
    answer: string;
}

export function faqSchema(faqs: FAQItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
}

// ─── Article / Blog Schema (EEAT-optimized) ─────────────────

interface ArticleSchemaInput {
    title: string;
    slug: string;
    description: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    authorName?: string;
    authorCredentials?: string;
    keywords?: string[];
    wordCount?: number;
}

export function articleSchema(article: ArticleSchemaInput) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${BASE_URL}/blog/${article.slug}/#article`,
        headline: article.title,
        description: article.description,
        image: article.image || BRAND.logo,
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        wordCount: article.wordCount || 1500,
        inLanguage: "en-CA",
        author: {
            "@type": "Person",
            name: article.authorName || "Mohawk Medibles Team",
            url: `${BASE_URL}/about`,
            jobTitle: "Cannabis Expert",
            description:
                article.authorCredentials ||
                "Certified cannabis specialist with 10+ years cultivation experience on Six Nations territory",
            worksFor: { "@id": `${BASE_URL}/#organization` },
        },
        publisher: { "@id": `${BASE_URL}/#organization` },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${BASE_URL}/blog/${article.slug}`,
        },
        keywords: article.keywords?.join(", "),
        isAccessibleForFree: true,
        speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".article-summary", ".key-takeaway"],
        },
    };
}

// ─── HowTo Schema ───────────────────────────────────────────

interface HowToStep {
    name: string;
    text: string;
    image?: string;
}

export function howToSchema(
    title: string,
    description: string,
    steps: HowToStep[],
    totalTime?: string
) {
    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: title,
        description: description,
        totalTime: totalTime || "PT10M",
        step: steps.map((step, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: step.name,
            text: step.text,
            ...(step.image && { image: step.image }),
        })),
    };
}

// ─── BreadcrumbList Schema ──────────────────────────────────

interface Breadcrumb {
    name: string;
    url: string;
}

export function breadcrumbSchema(items: Breadcrumb[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

// ─── Video Schema (for YouTube embeds) ──────────────────────

export function videoSchema(
    name: string,
    description: string,
    thumbnailUrl: string,
    uploadDate: string,
    contentUrl: string,
    duration?: string
) {
    return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name,
        description,
        thumbnailUrl,
        uploadDate,
        contentUrl,
        duration: duration || "PT5M",
        publisher: { "@id": `${BASE_URL}/#organization` },
    };
}

// ─── Speakable Schema (Voice Search / AEO) ──────────────────

export function speakableSchema(pageUrl: string, selectors: string[]) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": pageUrl,
        speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: selectors,
        },
    };
}

// ─── Multi-Schema Combiner ──────────────────────────────────

export function combineSchemas(...schemas: Record<string, unknown>[]) {
    return schemas;
}
