import { Metadata } from "next";
import { Suspense } from "react";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import OrderTracker from "@/components/OrderTracker";

export const metadata: Metadata = {
  title: "Track Order | Mohawk Medibles",
  description:
    "Track your Mohawk Medibles order status and delivery in real-time. Enter your order number to see live updates, estimated delivery, and carrier tracking.",
};

export default function TrackOrderPage() {
  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "Track Order", url: "https://mohawkmedibles.ca/track-order" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-950/30 via-background to-background py-14">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            Live Tracking
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-white mb-3 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Real-time updates on your delivery status
          </p>
        </div>
      </section>

      {/* Tracker */}
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }
      >
        <OrderTracker />
      </Suspense>
    </>
  );
}
