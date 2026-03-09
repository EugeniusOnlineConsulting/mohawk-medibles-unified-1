/**
 * Mohawk Medibles — SEO Module Barrel Export
 * ═══════════════════════════════════════════
 * Single import for all SEO utilities:
 *   import { productSchema, enhanceContentForGEO, analyzeKeywordGaps } from "@/lib/seo";
 */

// JSON-LD Schema Generators
export {
    organizationSchema,
    localBusinessSchema,
    websiteSchema,
    productSchema,
    faqSchema,
    articleSchema,
    howToSchema,
    breadcrumbSchema,
    videoSchema,
    speakableSchema,
    combineSchemas,
} from "./schemas";

// AEO (Answer Engine Optimization)
export {
    MASTER_FAQ_DATABASE,
    generatePAAForCategory,
    generateProductFAQs,
    getFAQsForSchema,
    formatForAEO,
} from "./aeo";
export type { FAQEntry, PeopleAlsoAsk } from "./aeo";

// GEO (Generative Engine Optimization)
export {
    CANNABIS_STATISTICS,
    EXPERT_QUOTATIONS,
    AUTHORITY_PHRASES,
    TECHNICAL_TERMS,
    enhanceContentForGEO,
    generateGEOMetaTags,
} from "./geo";
export type { GEOSignal, GEOEnhancedContent } from "./geo";

// Competitor Gap Analysis
export {
    COMPETITORS,
    SEED_KEYWORDS,
    analyzeKeywordGaps,
    findQuickWins,
    generateContentGapReport,
    fetchManusCompetitorData,
    runCompetitorAnalysis,
} from "./competitorGap";
export type { Competitor, KeywordOpportunity, ManusCompetitorData } from "./competitorGap";

// Backlink Strategy
export {
    BACKLINK_TARGETS,
    LINK_BAIT_IDEAS,
    generateBacklinkPlan,
} from "./backlinkStrategy";
export type { BacklinkTarget, LinkBaitContent } from "./backlinkStrategy";
