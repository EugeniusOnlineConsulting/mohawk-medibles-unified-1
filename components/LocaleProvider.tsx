/**
 * Mohawk Medibles — Locale Provider
 * ═════════════════════════════════
 * React context providing locale state, dictionary, and t() function.
 * Reads/writes locale preference to localStorage.
 * Updates document.documentElement.lang for accessibility.
 */
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { Locale, DEFAULT_LOCALE, getDictionary, translate, getStoredLocale, setStoredLocale, LOCALES } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

// ─── Context Types ──────────────────────────────────────────

interface LocaleContextType {
    locale: Locale;
    dictionary: Dictionary;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    locales: typeof LOCALES;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
    const [mounted, setMounted] = useState(false);

    // Read stored locale on mount
    useEffect(() => {
        const stored = getStoredLocale();
        setLocaleState(stored);
        setMounted(true);
    }, []);

    // Update HTML lang attribute
    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = LOCALES[locale].htmlLang;
        }
    }, [locale, mounted]);

    const dictionary = useMemo(() => getDictionary(locale), [locale]);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        setStoredLocale(newLocale);
    }, []);

    const t = useCallback((key: string) => translate(dictionary, key), [dictionary]);

    const value = useMemo(() => ({
        locale,
        dictionary,
        setLocale,
        t,
        locales: LOCALES,
    }), [locale, dictionary, setLocale, t]);

    return (
        <LocaleContext.Provider value={value}>
            {children}
        </LocaleContext.Provider>
    );
}

// ─── Hook ───────────────────────────────────────────────────

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("useLocale must be used within a LocaleProvider");
    }
    return context;
}

export default LocaleProvider;
