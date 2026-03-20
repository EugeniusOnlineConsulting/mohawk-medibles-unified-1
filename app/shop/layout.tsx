/**
 * Shop Layout
 *
 * Metadata and JSON-LD schemas have been moved to page.tsx where searchParams
 * are available, enabling category-specific SEO metadata and structured data.
 * This layout is kept minimal — it just wraps children.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
