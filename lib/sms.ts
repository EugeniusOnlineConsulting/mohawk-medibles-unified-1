/**
 * SMS Library — Mohawk Medibles
 * Uses Twilio SDK for sending SMS notifications.
 * Gracefully degrades if Twilio credentials are not configured.
 */
import { formatPhone } from "./phoneValidation";

// Lazy-load Twilio client to avoid import errors if not installed
let twilioClient: any = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("[SMS] Twilio credentials not configured — SMS will be skipped");
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const twilio = require("twilio");
    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
  } catch (err) {
    console.error("[SMS] Failed to initialize Twilio client:", err);
    return null;
  }
}

function getFromNumber(): string {
  return process.env.TWILIO_PHONE_NUMBER || "";
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a single SMS message.
 */
export async function sendSMS(to: string, body: string): Promise<SmsResult> {
  const client = getTwilioClient();
  const from = getFromNumber();

  if (!client || !from) {
    console.warn("[SMS] Twilio not configured — skipping SMS to", to);
    return { success: false, error: "Twilio not configured" };
  }

  const formattedTo = formatPhone(to);
  if (!formattedTo) {
    return { success: false, error: "Invalid phone number" };
  }

  try {
    const message = await client.messages.create({
      body,
      from,
      to: formattedTo,
    });

    return { success: true, messageId: message.sid };
  } catch (err: any) {
    console.error("[SMS] Send failed:", err?.message || err);
    return { success: false, error: err?.message || "SMS send failed" };
  }
}

/**
 * Send order confirmation SMS.
 */
export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string,
  total: number | string
): Promise<SmsResult> {
  const formattedTotal = typeof total === "number" ? total.toFixed(2) : total;
  const body = `Your Mohawk Medibles order #${orderNumber} ($${formattedTotal}) has been received! Track at mohawkmedibles.co/track-order`;
  return sendSMS(phone, body);
}

/**
 * Send shipping update SMS.
 */
export async function sendShippingUpdateSMS(
  phone: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string
): Promise<SmsResult> {
  const trackingUrl = carrier.toLowerCase().includes("canada post")
    ? `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${trackingNumber}`
    : `https://parcelsapp.com/en/tracking/${trackingNumber}`;

  const body = `Your order #${orderNumber} has shipped via ${carrier}! Track: ${trackingUrl}`;
  return sendSMS(phone, body);
}

/**
 * Send delivery confirmation SMS.
 */
export async function sendDeliveryConfirmationSMS(
  phone: string,
  orderNumber: string
): Promise<SmsResult> {
  const body = `Your order #${orderNumber} has been delivered! Enjoy \u{1F33F}`;
  return sendSMS(phone, body);
}

/**
 * Send promotional SMS.
 */
export async function sendPromoSMS(
  phone: string,
  message: string
): Promise<SmsResult> {
  const body = `${message}\n\nReply STOP to unsubscribe. Mohawk Medibles`;
  return sendSMS(phone, body);
}

/**
 * Log an SMS to the database (non-blocking helper).
 */
export async function logSmsToDb(params: {
  phone: string;
  message: string;
  status: string;
  type: string;
  orderId?: string;
  userId?: string;
  error?: string;
  messageId?: string;
}): Promise<void> {
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.smsLog.create({
      data: {
        phone: params.phone,
        message: params.message,
        status: params.status,
        type: params.type,
        orderId: params.orderId || null,
        error: params.error || null,
        providerMessageId: params.messageId || null,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[SMS] Failed to log SMS to DB:", err);
  }
}

/**
 * Send SMS and log to database — combined helper for order flows.
 */
export async function sendAndLogSMS(params: {
  phone: string;
  message: string;
  type: string;
  orderId?: string;
  userId?: string;
}): Promise<SmsResult> {
  const result = await sendSMS(params.phone, params.message);

  // Fire and forget the DB log
  logSmsToDb({
    phone: params.phone,
    message: params.message,
    status: result.success ? "SENT" : "FAILED",
    type: params.type,
    orderId: params.orderId,
    userId: params.userId,
    error: result.error,
    messageId: result.messageId,
  }).catch(() => {});

  return result;
}
