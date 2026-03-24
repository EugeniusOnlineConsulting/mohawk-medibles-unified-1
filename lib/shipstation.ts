/**
 * Mohawk Medibles — ShipStation V2 API Integration
 * Handles: order creation, label generation, tracking, rate estimates
 * Docs: https://docs.shipstation.com/
 */

const SHIPSTATION_API_BASE = "https://api.shipstation.com/v2";
const API_KEY = process.env.SHIPSTATION_API_KEY || "";

function getAuthHeaders() {
    return {
        "api-key": API_KEY,
        "Content-Type": "application/json",
    };
}

// ─── Types ──────────────────────────────────────────────────

export interface ShipStationAddress {
    name: string;
    phone?: string;
    company_name?: string;
    address_line1: string;
    address_line2?: string;
    address_line3?: string;
    city_locality: string;
    state_province: string;
    postal_code: string;
    country_code: string; // ISO 3166 (CA, US, etc.)
}

export interface ShipStationWeight {
    value: number;
    unit: "pound" | "ounce" | "gram" | "kilogram";
}

export interface ShipStationDimensions {
    length: number;
    width: number;
    height: number;
    unit: "inch" | "centimeter";
}

export interface ShipStationOrderItem {
    name: string;
    quantity: number;
    sku?: string;
    unit_price?: { amount: number; currency: string };
    weight?: ShipStationWeight;
}

export interface ShipStationLabel {
    label_id: string;
    shipment_id: string;
    tracking_number: string;
    carrier_code: string;
    service_code: string;
    ship_date: string;
    shipment_cost: { amount: number; currency: string };
    label_download: { href: string; pdf: string; png: string; zpl: string };
}

export interface ShipStationRate {
    rate_id: string;
    carrier_id: string;
    carrier_code: string;
    service_code: string;
    service_type: string;
    shipping_amount: { amount: number; currency: string };
    delivery_days: number;
    estimated_delivery_date: string;
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
 * Get shipping rates for a package.
 * Use this to show customers estimated shipping costs at checkout.
 */
export async function getRates(params: {
    shipFrom: ShipStationAddress;
    shipTo: ShipStationAddress;
    weight: ShipStationWeight;
    dimensions?: ShipStationDimensions;
    carrierIds?: string[];
}): Promise<ShipStationRate[]> {
    const body: Record<string, unknown> = {
        ship_from: params.shipFrom,
        ship_to: params.shipTo,
        weight: params.weight,
        confirmation: "none",
    };
    if (params.dimensions) body.dimensions = params.dimensions;
    if (params.carrierIds) body.carrier_ids = params.carrierIds;

    const result = await shipstationFetch("/rates", {
        method: "POST",
        body: JSON.stringify(body),
    });

    return result.rate_response?.rates || [];
}

/**
 * Purchase a shipping label.
 * Returns label PDF download URL and tracking number.
 */
export async function purchaseLabel(params: {
    shipFrom: ShipStationAddress;
    shipTo: ShipStationAddress;
    weight: ShipStationWeight;
    dimensions?: ShipStationDimensions;
    carrierCode: string;
    serviceCode: string;
    isTestLabel?: boolean;
}): Promise<ShipStationLabel> {
    const body: Record<string, unknown> = {
        shipment: {
            ship_from: params.shipFrom,
            ship_to: params.shipTo,
            packages: [
                {
                    weight: params.weight,
                    dimensions: params.dimensions,
                },
            ],
            carrier_id: params.carrierCode,
            service_code: params.serviceCode,
        },
        is_test_label: params.isTestLabel ?? process.env.NODE_ENV !== "production",
        label_format: "pdf",
        label_layout: "4x6",
    };

    return shipstationFetch("/labels", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * Track a shipment by label ID.
 */
export async function getTracking(labelId: string): Promise<{
    tracking_number: string;
    status_code: string;
    status_description: string;
    carrier_status_code: string;
    estimated_delivery_date: string;
    actual_delivery_date?: string;
    events: Array<{
        occurred_at: string;
        description: string;
        city_locality: string;
        state_province: string;
        country_code: string;
    }>;
}> {
    return shipstationFetch(`/labels/${labelId}/track`);
}

/**
 * Get available carriers and their services.
 */
export async function listCarriers() {
    return shipstationFetch("/carriers");
}

/**
 * Get services for a specific carrier.
 */
export async function listServices(carrierId: string) {
    return shipstationFetch(`/carriers/${carrierId}/services`);
}

// ─── Store address (ship-from) ──────────────────────────────

export const MOHAWK_MEDIBLES_ADDRESS: ShipStationAddress = {
    name: "Mohawk Medibles",
    company_name: "Mohawk Medibles",
    address_line1: "1738 York Road",
    city_locality: "Tyendinaga",
    state_province: "ON",
    postal_code: "K0K 3A0",
    country_code: "CA",
    phone: "6133961738",
};

// ─── Full Pipeline ──────────────────────────────────────────

/**
 * Full pipeline: Get best rate → Purchase label → Return tracking info.
 * Called after payment confirmation.
 */
export async function processOrderForShipping(orderData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: ShipStationAddress;
    items: ShipStationOrderItem[];
    totalWeight: ShipStationWeight;
    dimensions?: ShipStationDimensions;
    preferredCarrier?: string;
    preferredService?: string;
}): Promise<{
    labelId: string;
    trackingNumber: string;
    labelPdfUrl: string;
    carrier: string;
    service: string;
    shippingCost: number;
}> {
    // 1. Get rates to find best option (or use preferred)
    const carrierCode = orderData.preferredCarrier || "canada_post";
    const serviceCode = orderData.preferredService || "canadapost_xpresspost";

    // 2. Purchase label
    const label = await purchaseLabel({
        shipFrom: MOHAWK_MEDIBLES_ADDRESS,
        shipTo: orderData.shippingAddress,
        weight: orderData.totalWeight,
        dimensions: orderData.dimensions,
        carrierCode,
        serviceCode,
    });

    return {
        labelId: label.label_id,
        trackingNumber: label.tracking_number,
        labelPdfUrl: label.label_download?.pdf || label.label_download?.href || "",
        carrier: label.carrier_code,
        service: label.service_code,
        shippingCost: label.shipment_cost?.amount || 0,
    };
}
