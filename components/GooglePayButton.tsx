"use client";

/**
 * GooglePayButton — UCP-Compatible Google Pay Component
 * ═════════════════════════════════════════════════════════
 * Renders a Google Pay button that integrates with the MedAgent
 * checkout API. Uses the Google Pay web API directly for
 * maximum compatibility (no extra npm deps).
 */

import { useState, useEffect, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────

interface GooglePayButtonProps {
    totalPrice: string; // e.g. "45.99"
    currencyCode?: string;
    countryCode?: string;
    onPaymentAuthorized?: (paymentData: unknown) => void;
    onError?: (error: Error) => void;
    disabled?: boolean;
    className?: string;
}

interface GooglePayClient {
    isReadyToPay: (req: unknown) => Promise<{ result: boolean }>;
    createButton: (opts: unknown) => HTMLElement;
    loadPaymentData: (req: unknown) => Promise<unknown>;
}

declare global {
    interface Window {
        google?: {
            payments?: {
                api?: {
                    PaymentsClient: new (config: unknown) => GooglePayClient;
                };
            };
        };
    }
}

// ─── Configuration ──────────────────────────────────────────

const BASE_REQUEST = {
    apiVersion: 2,
    apiVersionMinor: 0,
};

const CARD_PAYMENT_METHOD = {
    type: "CARD",
    parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["VISA", "MASTERCARD", "AMEX", "DISCOVER"],
    },
    tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
            gateway: "stripe",
            gatewayMerchantId: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
        },
    },
};

// ─── Component ──────────────────────────────────────────────

export default function GooglePayButton({
    totalPrice,
    currencyCode = "CAD",
    countryCode = "CA",
    onPaymentAuthorized,
    onError,
    disabled = false,
    className = "",
}: GooglePayButtonProps) {
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [client, setClient] = useState<GooglePayClient | null>(null);

    // Load Google Pay script
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Check if already loaded
        if (window.google?.payments?.api?.PaymentsClient) {
            initClient();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://pay.google.com/gp/p/js/pay.js";
        script.async = true;
        script.onload = initClient;
        script.onerror = () => onError?.(new Error("Failed to load Google Pay"));
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function initClient() {
        if (!window.google?.payments?.api?.PaymentsClient) return;

        const paymentsClient = new window.google.payments.api.PaymentsClient({
            environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
        });

        paymentsClient
            .isReadyToPay({
                ...BASE_REQUEST,
                allowedPaymentMethods: [CARD_PAYMENT_METHOD],
            })
            .then((response) => {
                if (response.result) {
                    setIsReady(true);
                    setClient(paymentsClient);
                }
            })
            .catch((err: Error) => {
                console.error("[Google Pay] isReadyToPay error:", err);
                onError?.(err);
            });
    }

    const handleClick = useCallback(async () => {
        if (!client || disabled || isLoading) return;

        setIsLoading(true);

        const paymentDataRequest = {
            ...BASE_REQUEST,
            allowedPaymentMethods: [CARD_PAYMENT_METHOD],
            merchantInfo: {
                merchantName: "Mohawk Medibles",
                merchantId: process.env.NEXT_PUBLIC_GOOGLE_MERCHANT_ID || "",
            },
            transactionInfo: {
                totalPriceStatus: "FINAL",
                totalPrice,
                currencyCode,
                countryCode,
            },
        };

        try {
            const paymentData = await client.loadPaymentData(paymentDataRequest);
            onPaymentAuthorized?.(paymentData);
        } catch (err) {
            if ((err as { statusCode?: string }).statusCode !== "CANCELED") {
                console.error("[Google Pay] Payment error:", err);
                onError?.(err instanceof Error ? err : new Error("Payment failed"));
            }
        } finally {
            setIsLoading(false);
        }
    }, [client, disabled, isLoading, totalPrice, currencyCode, countryCode, onPaymentAuthorized, onError]);

    if (!isReady) return null;

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={`google-pay-button ${className}`}
            aria-label="Pay with Google Pay"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "14px 24px",
                background: disabled ? "#555" : "#000",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.2s ease",
            }}
        >
            {isLoading ? (
                <span style={{ opacity: 0.8 }}>Processing...</span>
            ) : (
                <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor" />
                    </svg>
                    <span>Pay with Google Pay</span>
                </>
            )}
        </button>
    );
}
