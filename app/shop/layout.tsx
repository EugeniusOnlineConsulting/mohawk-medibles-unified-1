import { Metadata } from "next";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import { getAllProducts } from "@/lib/products";

const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "Shop", url: "https://mohawkmedibles.ca/shop" },
]);

export const metadata: Metadata = {
    title: "Shop Cannabis Online — Flower, Edibles, Concentrates & More",
    description:
        "Browse 363+ premium cannabis products at Mohawk Medibles. Lab-tested flower, edibles, concentrates, vapes, and accessories. Indigenous-owned, Empire Standard™ quality. Ships Canada-wide via Xpresspost.",
    openGraph: {
        title: "Shop Cannabis Online | Mohawk Medibles",
        description:
            "363+ lab-tested cannabis products: flower, edibles, concentrates, vapes, pre-rolls, and accessories. Indigenous-owned, Empire Standard™ quality.",
        url: "https://mohawkmedibles.ca/shop",
        type: "website",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/shop",
    },
};

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    const allProducts = await getAllProducts();
    const featured = allProducts.filter(p => p.featured).slice(0, 20);
    const itemsForSchema = featured.length > 0 ? featured : allProducts.slice(0, 20);

    const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Mohawk Medibles — Full Cannabis Collection",
        description: `Browse ${allProducts.length}+ premium cannabis products from Mohawk Medibles.`,
        url: "https://mohawkmedibles.ca/shop",
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: allProducts.length,
            itemListElement: itemsForSchema.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                    "@type": "Product",
                    name: p.name,
                    url: `https://mohawkmedibles.ca/product/${p.slug}`,
                    image: p.image,
                    offers: {
                        "@type": "Offer",
                        price: p.price,
                        priceCurrency: "CAD",
                        availability: "https://schema.org/InStock",
                    },
                },
            })),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            {children}
        </>
    );
}
