"use client";

/**
 * LocaleSEOHead — Dynamic SEO meta tags for locale switching
 * ══════════════════════════════════════════════════════════
 * Updates document title, meta description, og:locale, and
 * content-language when the user switches locale.
 * Works alongside Next.js server-side generateMetadata.
 */

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALES } from "@/lib/i18n";

interface LocaleSEOHeadProps {
  /** SEO dictionary key for this page's title (e.g. "seo.shopTitle") */
  pageKey?: string;
}

export default function LocaleSEOHead({ pageKey }: LocaleSEOHeadProps) {
  const { locale, t } = useLocale();

  useEffect(() => {
    // Only override when non-English locale is active
    if (locale === "en") return;

    const localeInfo = LOCALES[locale];

    // Update document title
    const titleKey = pageKey || "seo.siteTitle";
    const localizedTitle = t(titleKey);
    if (localizedTitle !== titleKey) {
      document.title = localizedTitle;
    }

    // Update meta description
    const descKey = pageKey
      ? pageKey.replace("Title", "Description")
      : "seo.siteDescription";
    const localizedDesc = t(descKey);
    let metaDesc = document.querySelector('meta[name="description"]');
    if (localizedDesc !== descKey) {
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", localizedDesc);
    }

    // Update og:locale
    let ogLocale = document.querySelector('meta[property="og:locale"]');
    if (!ogLocale) {
      ogLocale = document.createElement("meta");
      ogLocale.setAttribute("property", "og:locale");
      document.head.appendChild(ogLocale);
    }
    ogLocale.setAttribute("content", localeInfo.ogLocale);

    // Update content-language
    let contentLang = document.querySelector(
      'meta[http-equiv="content-language"]'
    );
    if (!contentLang) {
      contentLang = document.createElement("meta");
      contentLang.setAttribute("http-equiv", "content-language");
      document.head.appendChild(contentLang);
    }
    contentLang.setAttribute("content", localeInfo.htmlLang);
  }, [locale, t, pageKey]);

  return null;
}
