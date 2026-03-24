/**
 * QR Code Generation Utilities
 * Generates QR codes for orders and products
 */
import QRCode from "qrcode";

/**
 * Generate a QR code data URL for an order number
 * QR encodes: {"type":"order","number":"MM-12345"}
 */
export async function generateOrderQR(orderNumber: string): Promise<string> {
  const payload = JSON.stringify({ type: "order", number: orderNumber });
  return QRCode.toDataURL(payload, {
    width: 256,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a QR code data URL for a product SKU
 * QR encodes: {"type":"product","sku":"SKU-123"}
 */
export async function generateProductQR(sku: string): Promise<string> {
  const payload = JSON.stringify({ type: "product", sku });
  return QRCode.toDataURL(payload, {
    width: 256,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a printable QR label (larger size for printing)
 */
export async function generatePrintableQR(
  data: string,
  size: number = 512
): Promise<string> {
  return QRCode.toDataURL(data, {
    width: size,
    margin: 3,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "H",
  });
}
