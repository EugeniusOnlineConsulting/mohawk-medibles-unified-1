import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  Copy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Track your Mohawk Medibles order status and delivery. Enter your order number to see real-time updates.",
};

// Map Prisma OrderStatus enum to progress step keys
const STATUS_TO_STEP: Record<string, string> = {
  PENDING: "pending",
  PROCESSING: "processing",
  PAYMENT_CONFIRMED: "processing",
  LABEL_PRINTED: "processing",
  SHIPPED: "shipped",
  IN_TRANSIT: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "delivered",
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order;

  let order: any = null;
  if (orderNumber) {
    order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        address: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  const stepDefs = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStepKey = order ? (STATUS_TO_STEP[order.status] || "pending") : "pending";

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "Track Order", url: "https://mohawkmedibles.ca/track-order" },
  ]);

  // Parse shipping data JSON if present
  let shippingInfo: any = null;
  if (order?.shippingData) {
    try {
      shippingInfo = JSON.parse(order.shippingData);
    } catch {}
  }
  // Fallback to address relation
  const address = shippingInfo || order?.address;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />

      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Search className="w-3.5 h-3.5" />
            Order Tracking
          </div>
          <h1 className="text-5xl font-heading font-black text-white mb-3">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter your order number to check the status
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Search Form */}
        <form action="/track-order" method="get" className="mb-10">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="order"
                defaultValue={orderNumber}
                placeholder="Enter your order number (e.g. MM-...)"
                required
                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-black font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              Track
            </button>
          </div>
        </form>

        {orderNumber && !order && (
          <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-bold">Order not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please check your order number and try again.
            </p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-lg">
                      {order.orderNumber}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Placed{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-CA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""}
                  </p>
                </div>
                <span className="text-primary font-bold text-xl">
                  {formatPrice(order.total)}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="relative">
                {/* Progress line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-primary transition-all"
                  style={{
                    width: `${(stepDefs.findIndex((s) => s.key === currentStepKey) / (stepDefs.length - 1)) * 100}%`,
                    maxWidth: "calc(100% - 2rem)",
                  }}
                />

                <div className="relative flex items-start justify-between">
                  {stepDefs.map((step, i) => {
                    const currentIdx = stepDefs.findIndex(
                      (s) => s.key === currentStepKey
                    );
                    const isActive = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center text-center w-20"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                            isActive
                              ? "bg-primary text-black"
                              : "bg-card border border-border text-muted-foreground"
                          } ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-medium ${
                            isActive
                              ? "text-primary font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tracking Number
                      </p>
                      <p className="font-bold text-white font-mono">
                        {order.trackingNumber}
                      </p>
                    </div>
                    {order.carrier && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Carrier</p>
                        <p className="font-bold text-white">
                          {order.carrier === "canada_post"
                            ? "Canada Post"
                            : order.carrier === "purolator"
                              ? "Purolator"
                              : order.carrier}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping address from JSON shippingData or Address relation */}
              {address && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-bold text-white text-xs uppercase tracking-wider mb-1">
                        Ship To
                      </p>
                      {shippingInfo ? (
                        <>
                          <p>
                            {shippingInfo.first_name || shippingInfo.firstName}{" "}
                            {shippingInfo.last_name || shippingInfo.lastName}
                          </p>
                          <p>{shippingInfo.address_1 || shippingInfo.street1}</p>
                          <p>
                            {shippingInfo.city},{" "}
                            {shippingInfo.state || shippingInfo.province}{" "}
                            {shippingInfo.postcode || shippingInfo.postalCode}
                          </p>
                        </>
                      ) : order.address ? (
                        <>
                          <p>
                            {order.address.firstName} {order.address.lastName}
                          </p>
                          <p>{order.address.street1}</p>
                          <p>
                            {order.address.city}, {order.address.province}{" "}
                            {order.address.postalCode}
                          </p>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
                  Status History
                </h2>
                <div className="space-y-4">
                  {order.statusHistory.map((entry: any, i: number) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                            i === 0 ? "bg-primary" : "bg-border"
                          }`}
                        />
                        {i < order.statusHistory.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-semibold ${
                            i === 0 ? "text-primary" : "text-white"
                          }`}
                        >
                          {entry.status.replace(/_/g, " ")}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {entry.note}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(entry.createdAt).toLocaleDateString(
                            "en-CA",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex gap-3">
              <Link
                href="/account/orders"
                className="flex-1 text-center px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-white hover:border-primary/50 transition-colors"
              >
                All Orders
              </Link>
              <Link
                href="/contact"
                className="flex-1 text-center px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-white hover:border-primary/50 transition-colors"
              >
                Need Help?
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
