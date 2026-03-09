/**
 * /delivery/hamilton — Local SEO Landing Page
 */
import { Metadata } from "next";
import { SERVICE_AREAS, localLandingPageMetadata, serviceAreaSchema } from "@/lib/seo/local-seo";
import DeliveryLanding from "@/components/DeliveryLanding";

const area = SERVICE_AREAS.find((a) => a.slug === "hamilton")!;

export const metadata: Metadata = localLandingPageMetadata(area);

export default function HamiltonDeliveryPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaSchema(area)) }}
            />
            <DeliveryLanding
                city={area.city}
                region={area.region}
                deliveryTime={area.deliveryTime}
                description={area.description}
                keywords={area.keywords}
                nearbyAreas={["Brantford", "Caledonia", "Six Nations"]}
            />
        </>
    );
}
