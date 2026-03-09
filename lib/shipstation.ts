/**
 * Mohawk Medibles — ShipStation API Integration
 * Handles: order creation, label printing, tracking sync
 * Docs: https://www.shipstation.com/docs/api/
 */

const SHIPSTATION_API_BASE = "https://ssapi.shipstation.com";
const API_KEY = process.env.SHIPSTATION_API_KEY || "";
const API_SECRET = process.env.SHIPSTATION_API_SECRET || "";

function getAuthHeaders() {
    const encoded = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
    return {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
    };
}

// ─── Types ──────────────────────────────────────────────────

export interface ShipStationOrder {
    orderId?: number;
    orderNumber: string;
    orderDate: string;
    orderStatus: "awaiting_shipment" | "shipped" | "cancelled";
    billTo: ShipStationAddress;
    shipTo: ShipStationAddress;
    items: ShipStationItem[];
    amountPaid: number;
    shippingAmount: number;
    customerEmail: string;
    customerNotes?: string;
}

export interface ShipStationAddress {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
}

export interface ShipStationItem {
    lineItemKey: string;
    sku?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
}

export interface ShipStationLabel {
    shipmentId: number;
    labelData: string;  // Base64 PDF
    trackingNumber: string;
    carrierCode: string;
    serviceCode: string;
    shipDate: string;
    shipmentCost: number;
}

// ─── API Methods ────────────────────────────────────────────

async function shipstationFetch(endpoint: string, options?: RequestInit) {
    const res = await fetch(`${SHIPSTATION_API_BASE}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options?.headers || {}),
        },
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`ShipStation API error (${res.status}): ${error}`);
    }

    return res.json();
}

/**
 * Create or update an order in ShipStation.
 * Called when payment is confirmed.
 */
export async function createShipStationOrder(order: ShipStationOrder): Promise<{ orderId: number }> {
    return shipstationFetch("/orders/createorder", {
        method: "POST",
        body: JSON.stringify(order),
    });
}

/**
 * Generate a shipping label for an order.
 * Automatically triggered after payment confirmation.
 */
export async function createLabel(
    orderId: number,
    carrierCode: string = "canada_post",
    serviceCode: string = "canadapost_xpresspost",
    packageCode: string = "package",
    weight: { value: number; units: string } = { value: 16, units: "ounces" },
    dimensions?: { length: number; width: number; height: number; units: string }
): Promise<ShipStationLabel> {
    return shipstationFetch("/orders/createlabelfororder", {
        method: "POST",
        body: JSON.stringify({
            orderId,
            carrierCode,
            serviceCode,
            packageCode,
            weight,
            dimensions,
            testLabel: process.env.NODE_ENV !== "production",
        }),
    });
}

/**
 * Get tracking info for a shipment.
 */
export async function getTracking(
    carrierCode: string,
    trackingNumber: string
): Promise<{
    trackingNumber: string;
    statusCode: string;
    statusDescription: string;
    carrierStatusCode: string;
    shipDate: string;
    estimatedDeliveryDate: string;
}> {
    return shipstationFetch(
        `/shipments?trackingNumber=${trackingNumber}&carrierCode=${carrierCode}`
    );
}

/**
 * List recent shipments (for logistics dashboard).
 */
export async function listShipments(params?: {
    createDateStart?: string;
    createDateEnd?: string;
    pageSize?: number;
    page?: number;
}) {
    const query = new URLSearchParams();
    if (params?.createDateStart) query.set("createDateStart", params.createDateStart);
    if (params?.createDateEnd) query.set("createDateEnd", params.createDateEnd);
    query.set("pageSize", String(params?.pageSize || 50));
    query.set("page", String(params?.page || 1));

    return shipstationFetch(`/shipments?${query.toString()}`);
}

/**
 * Get available carriers and services.
 */
export async function listCarriers() {
    return shipstationFetch("/carriers");
}

/**
 * Full pipeline: Payment confirmed → Create ShipStation order → Print label.
 * Returns tracking number and label PDF.
 */
export async function processOrderForShipping(orderData: {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    shippingAddress: ShipStationAddress;
    billingAddress: ShipStationAddress;
    items: ShipStationItem[];
    total: number;
    shippingCost: number;
}): Promise<{
    shipstationOrderId: number;
    trackingNumber: string;
    labelPdf: string;
    carrier: string;
}> {
    // 1. Create ShipStation order
    const ssOrder = await createShipStationOrder({
        orderNumber: orderData.orderNumber,
        orderDate: new Date().toISOString(),
        orderStatus: "awaiting_shipment",
        billTo: orderData.billingAddress,
        shipTo: orderData.shippingAddress,
        items: orderData.items,
        amountPaid: orderData.total,
        shippingAmount: orderData.shippingCost,
        customerEmail: orderData.customerEmail,
    });

    // 2. Create label (auto-print on ShipStation desktop)
    const label = await createLabel(ssOrder.orderId);

    return {
        shipstationOrderId: ssOrder.orderId,
        trackingNumber: label.trackingNumber,
        labelPdf: label.labelData,
        carrier: label.carrierCode,
    };
}
