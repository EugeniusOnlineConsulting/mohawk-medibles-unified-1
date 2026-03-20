/**
 * Mohawk Medibles — Language Switcher
 * ════════════════════════════════════
 * Compact dropdown: 🇬🇧 EN | 🇫🇷 FR | 🪶 MOH
 * High-contrast in both light and dark mode.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
    const { locale, setLocale, locales } = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    const currentLocale = locales[locale];

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/60 text-foreground hover:text-foreground hover:bg-muted/60 dark:border-white/15 dark:text-white/90 dark:hover:bg-white/10 transition-all duration-200 text-xs font-semibold tracking-wider uppercase"
                aria-label={`Language: ${currentLocale.label}`}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <Globe className="h-3.5 w-3.5" />
                <span>{currentLocale.flag} {locale.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div
                    className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-border dark:border-white/15 bg-card shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden z-[80]"
                    role="listbox"
                    aria-label="Select language"
                >
                    {(Object.entries(locales) as [Locale, typeof locales[Locale]][]).map(([key, meta]) => (
                        <button
                            key={key}
                            role="option"
                            aria-selected={locale === key}
                            onClick={() => {
                                setLocale(key);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-sm ${locale === key
                                    ? "bg-lime/15 dark:bg-lime/10 text-foreground dark:text-white font-semibold"
                                    : "text-foreground/70 dark:text-white/70 hover:bg-muted/50 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white"
                                }`}
                        >
                            <span className="text-lg">{meta.flag}</span>
                            <div className="flex flex-col">
                                <span className="font-medium">{meta.label}</span>
                                <span className="text-[10px] tracking-wider uppercase text-muted-foreground">
                                    {key === "en" && "English"}
                                    {key === "fr" && "Canadian French"}
                                    {key === "moh" && "Mohawk · Iroquoian"}
                                </span>
                            </div>
                            {locale === key && (
                                <span className="ml-auto text-lime font-bold text-xs">✓</span>
                            )}
                        </button>
                    ))}
                    <div className="px-4 py-2 border-t border-border dark:border-white/5 text-[10px] text-muted-foreground tracking-wide">
                        🪶 Kanyen'kéha translations by community
                    </div>
                </div>
            )}
        </div>
    );
}
