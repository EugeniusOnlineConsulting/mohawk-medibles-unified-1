/**
 * Mohawk Medibles — i18n Dictionary System
 * ═════════════════════════════════════════
 * Lightweight client-side internationalization.
 * Three locales: English (en), French (fr), Kanyen'kéha/Mohawk (moh).
 */

import en from "./dictionaries/en";
import fr from "./dictionaries/fr";
import moh from "./dictionaries/moh";

// ─── Types ──────────────────────────────────────────────────

export type Locale = "en" | "fr" | "moh";
export type Dictionary = typeof en;
export type DictionaryKey = keyof Dictionary;
export type NestedKey<T> = T extends object
    ? { [K in keyof T]: K extends string ? (T[K] extends string ? K : `${K}.${NestedKey<T[K]>}`) : never }[keyof T]
    : never;

// ─── Locale Metadata ────────────────────────────────────────

export const LOCALES: Record<Locale, { label: string; flag: string; htmlLang: string; ogLocale: string }> = {
    en: { label: "English", flag: "🇬🇧", htmlLang: "en", ogLocale: "en_CA" },
    fr: { label: "Français", flag: "🇫🇷", htmlLang: "fr", ogLocale: "fr_CA" },
    moh: { label: "Kanyen'kéha", flag: "🪶", htmlLang: "moh", ogLocale: "en_CA" },
};

export const DEFAULT_LOCALE: Locale = "en";

// ─── Dictionary Loader ──────────────────────────────────────

const dictionaries: Record<Locale, Dictionary> = { en, fr, moh };

export function getDictionary(locale: Locale): Dictionary {
    return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

// ─── Translation Helper ─────────────────────────────────────
// Supports dot-notation keys: t("nav.shop") → "Shop"

export function translate(dictionary: Dictionary, key: string): string {
    const keys = key.split(".");
    let result: unknown = dictionary;
    for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
            result = (result as Record<string, unknown>)[k];
        } else {
            return key; // Fallback to key if not found
        }
    }
    return typeof result === "string" ? result : key;
}

// ─── Locale Storage ─────────────────────────────────────────

const LOCALE_STORAGE_KEY = "mm-locale";

export function getStoredLocale(): Locale {
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && stored in dictionaries) return stored as Locale;
    return DEFAULT_LOCALE;
}

export function setStoredLocale(locale: Locale): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
