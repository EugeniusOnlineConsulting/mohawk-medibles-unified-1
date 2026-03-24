"use client";

import { useState, useEffect } from "react";
import { Smartphone, Check, Loader2 } from "lucide-react";

interface SmsOptInProps {
  /** Pre-filled phone number from billing form */
  phone?: string;
  /** Whether user is authenticated (required for tRPC) */
  isAuthenticated?: boolean;
}

/**
 * SMS Opt-In Toggle — shows at checkout for order SMS updates.
 * Uses fetch to /api/sms/opt-in for simplicity in the checkout flow.
 */
export default function SmsOptIn({ phone: initialPhone, isAuthenticated }: SmsOptInProps) {
  const [optedIn, setOptedIn] = useState(false);
  const [phone, setPhone] = useState(initialPhone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load existing opt-in status
  useEffect(() => {
    if (!isAuthenticated) {
      setLoaded(true);
      return;
    }

    fetch("/api/sms/opt-in")
      .then((res) => res.json())
      .then((data) => {
        if (data.optedIn) {
          setOptedIn(true);
          if (data.phone) setPhone(data.phone);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [isAuthenticated]);

  // Update phone from parent prop
  useEffect(() => {
    if (initialPhone && !phone) {
      setPhone(initialPhone);
    }
  }, [initialPhone, phone]);

  async function handleToggle() {
    if (!isAuthenticated) {
      // For guests, just toggle the UI state — the checkout flow will use the billing phone
      setOptedIn(!optedIn);
      return;
    }

    const newState = !optedIn;
    if (newState && !phone.trim()) {
      setError("Enter your phone number first");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/sms/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), optedIn: newState }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update");
        setSaving(false);
        return;
      }

      setOptedIn(newState);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save preference");
    }

    setSaving(false);
  }

  if (!loaded) return null;

  return (
    <div className="bg-forest/5 dark:bg-leaf/10 rounded-xl p-4 mt-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-forest/10 dark:bg-leaf/20 rounded-lg flex-shrink-0">
          <Smartphone className="h-4 w-4 text-forest dark:text-leaf" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-forest dark:text-cream cursor-pointer select-none">
              Get SMS updates for your orders?
            </label>
            <button
              onClick={handleToggle}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-forest/30 ${
                optedIn
                  ? "bg-forest dark:bg-leaf"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              role="switch"
              aria-checked={optedIn}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  optedIn ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {optedIn && (
            <div className="mt-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                placeholder="(XXX) XXX-XXXX"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white dark:bg-gray-800 focus:ring-2 focus:ring-forest/30 outline-none transition"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Canadian numbers only. Msg rates may apply. Reply STOP to unsubscribe.
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}

          {saved && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
              <Check className="h-3 w-3" /> Saved
            </div>
          )}

          {saving && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
