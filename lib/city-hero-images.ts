/**
 * City & Province Hero Image Data
 * ════════════════════════════════
 * Province-based theming system for city delivery hero sections.
 * Maps each province to a gradient/color scheme and generates
 * city-specific hero metadata (alt text, titles, subtitles).
 *
 * When real city photos are available, extend CityHeroData with
 * an `imageSrc` field and swap the gradient background for an <Image>.
 */

// ─── Province Theme Definitions ──────────────────────────────────────────

export interface ProvinceTheme {
    /** Tailwind gradient classes (bg-gradient-to-br) */
    gradient: string;
    /** Accent color name for badges/highlights */
    accent: string;
    /** Secondary gradient overlay for depth */
    overlay: string;
    /** Decorative icon/emoji for the region */
    icon: string;
}

export const PROVINCE_THEMES: Record<string, ProvinceTheme> = {
    "ontario": {
        gradient: "from-emerald-950/95 via-green-900/90 to-emerald-800/80",
        accent: "lime",
        overlay: "from-black/30 via-transparent to-emerald-950/40",
        icon: "🍁",
    },
    "british-columbia": {
        gradient: "from-teal-950/95 via-cyan-900/90 to-teal-800/80",
        accent: "emerald",
        overlay: "from-black/30 via-transparent to-teal-950/40",
        icon: "🏔️",
    },
    "alberta": {
        gradient: "from-amber-950/95 via-yellow-900/90 to-amber-800/80",
        accent: "amber",
        overlay: "from-black/30 via-transparent to-amber-950/40",
        icon: "🌾",
    },
    "quebec": {
        gradient: "from-blue-950/95 via-indigo-900/90 to-blue-800/80",
        accent: "blue",
        overlay: "from-black/30 via-transparent to-blue-950/40",
        icon: "⚜️",
    },
    "manitoba": {
        gradient: "from-rose-950/95 via-red-900/90 to-rose-800/80",
        accent: "rose",
        overlay: "from-black/30 via-transparent to-rose-950/40",
        icon: "🦬",
    },
    "saskatchewan": {
        gradient: "from-yellow-950/95 via-amber-900/90 to-orange-800/80",
        accent: "yellow",
        overlay: "from-black/30 via-transparent to-yellow-950/40",
        icon: "🌻",
    },
    "nova-scotia": {
        gradient: "from-sky-950/95 via-blue-900/90 to-cyan-800/80",
        accent: "sky",
        overlay: "from-black/30 via-transparent to-sky-950/40",
        icon: "⚓",
    },
    "new-brunswick": {
        gradient: "from-indigo-950/95 via-blue-900/90 to-sky-800/80",
        accent: "indigo",
        overlay: "from-black/30 via-transparent to-indigo-950/40",
        icon: "🌊",
    },
    "newfoundland-and-labrador": {
        gradient: "from-slate-950/95 via-cyan-900/90 to-slate-800/80",
        accent: "cyan",
        overlay: "from-black/30 via-transparent to-slate-950/40",
        icon: "🐋",
    },
    "prince-edward-island": {
        gradient: "from-red-950/95 via-rose-900/90 to-orange-800/80",
        accent: "rose",
        overlay: "from-black/30 via-transparent to-red-950/40",
        icon: "🏖️",
    },
    "northwest-territories": {
        gradient: "from-violet-950/95 via-purple-900/90 to-indigo-800/80",
        accent: "violet",
        overlay: "from-black/30 via-transparent to-violet-950/40",
        icon: "🌌",
    },
    "nunavut": {
        gradient: "from-cyan-950/95 via-sky-900/90 to-blue-800/80",
        accent: "cyan",
        overlay: "from-black/30 via-transparent to-cyan-950/40",
        icon: "❄️",
    },
    "yukon": {
        gradient: "from-emerald-950/95 via-teal-900/90 to-green-800/80",
        accent: "emerald",
        overlay: "from-black/30 via-transparent to-emerald-950/40",
        icon: "🐻",
    },
};

// ─── Hero Data Generators ────────────────────────────────────────────────

export interface CityHeroData {
    heroTitle: string;
    heroSubtitle: string;
    heroAlt: string;
    theme: ProvinceTheme;
}

export interface ProvinceHeroData {
    heroTitle: string;
    heroSubtitle: string;
    heroAlt: string;
    theme: ProvinceTheme;
}

const DEFAULT_THEME: ProvinceTheme = {
    gradient: "from-forest/95 via-emerald-900/90 to-green-800/80",
    accent: "lime",
    overlay: "from-black/30 via-transparent to-forest/40",
    icon: "🍁",
};

/**
 * Get hero section data for a specific city page.
 */
export function getCityHeroData(
    cityName: string,
    provinceName: string,
    provinceSlug: string,
): CityHeroData {
    const theme = PROVINCE_THEMES[provinceSlug] ?? DEFAULT_THEME;

    return {
        heroTitle: `Cannabis Delivery to ${cityName}`,
        heroSubtitle: `Fast, discreet shipping from Tyendinaga Mohawk Territory to ${cityName}, ${provinceName}`,
        heroAlt: `Cannabis delivery to ${cityName}, ${provinceName} — Mohawk Medibles premium cannabis products shipped directly to your door`,
        theme,
    };
}

/**
 * Get hero section data for a province page.
 */
export function getProvinceHeroData(
    provinceName: string,
    provinceSlug: string,
    cityCount: number,
): ProvinceHeroData {
    const theme = PROVINCE_THEMES[provinceSlug] ?? DEFAULT_THEME;

    return {
        heroTitle: `Cannabis Delivery to ${provinceName}`,
        heroSubtitle: `Premium lab-tested cannabis shipped to ${cityCount}+ cities across ${provinceName} from Tyendinaga Mohawk Territory`,
        heroAlt: `Cannabis delivery across ${provinceName} — Mohawk Medibles serves ${cityCount}+ cities with premium products`,
        theme,
    };
}
