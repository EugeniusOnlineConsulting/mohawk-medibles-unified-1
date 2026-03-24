"use client";

import { HeroCarousel } from "@/components/HeroCarousel";
import { BentoGrid } from "@/components/BentoGrid";
import { DealTicker } from "@/components/DealTicker";
import { EffectFilter } from "@/components/EffectFilter";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrustPillars } from "@/components/TrustPillars";
import { DealsSection } from "@/components/DealsSection";
import DealOfTheDay from "@/components/DealOfTheDay";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { StickyMobileNav } from "@/components/StickyMobileNav";
import { CategoryBrandShowcase } from "@/components/CategoryBrandShowcase";
import { BenefitsBar } from "@/components/BenefitsBar";
import { MonthlyDeals } from "@/components/MonthlyDeals";
import { HowItWorks } from "@/components/HowItWorks";
import { CustomerTestimonials } from "@/components/CustomerTestimonials";
import NewArrivals from "@/components/NewArrivals";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";
import ContestBanner from "@/components/ContestBanner";
import ShopByMood from "@/components/ShopByMood";
import MixMatchCTA from "@/components/MixMatchCTA";
import StorePromo from "@/components/StorePromo";
import TerritoryGrownSection from "@/components/TerritoryGrownSection";

export default function HomeClient() {
  return (
    <div className="min-h-screen flex flex-col relative">

      {/* ═══════════════════════════════════════════════════════════
          CONTEST BANNER — Active contest promo with countdown
          Only renders when there's an active contest
          ═══════════════════════════════════════════════════════════ */}
      <ContestBanner />

      {/* ═══════════════════════════════════════════════════════════
          HERO CAROUSEL — .cc 4-slide rotating banners + .ca photography
          Conversion: Anchoring ($5/G), Visual Hierarchy, Cognitive Ease
          Auto-advances every 6s, pause on hover, crossfade transitions
          ═══════════════════════════════════════════════════════════ */}
      <HeroCarousel />

      {/* ═══════════════════════════════════════════════════════════
          BENEFITS BAR — .cc 5-column trust signals
          Free Shipping, Discreet Packaging, Indigenous Owned, Delivery, Since 2018
          ═══════════════════════════════════════════════════════════ */}
      <BenefitsBar />

      {/* ═══════════════════════════════════════════════════════════
          DEAL TICKER — .cc scrolling marquee with live deals
          Conversion: Scarcity, Urgency, Loss Aversion
          ═══════════════════════════════════════════════════════════ */}
      <DealTicker />

      {/* ═══════════════════════════════════════════════════════════
          SOCIAL PROOF STRIP — Stats bar
          Conversion: Social Proof, Authority, Commitment
          ═══════════════════════════════════════════════════════════ */}
      <SocialProofStrip />

      {/* ═══════════════════════════════════════════════════════════
          EFFECT-BASED FILTER — "What are you looking for?"
          Conversion: Cognitive Ease, Fogg Model (simplify action)
          ═══════════════════════════════════════════════════════════ */}
      <EffectFilter />

      {/* ═══════════════════════════════════════════════════════════
          SHOP BY MOOD — Intent-based shopping cards
          "How Do You Want to Feel?" — 5 mood cards
          Conversion: Cognitive Ease, Emotional Resonance, Discovery
          ═══════════════════════════════════════════════════════════ */}
      <ShopByMood />

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY + BRAND SHOWCASE — Unified section with Mohawk
          Territory tile pattern. Category carousel + auto-scrolling
          Brand carousel with expand to 3-row / full grid.
          Conversion: Authority, Brand Trust, Product Discovery
          ═══════════════════════════════════════════════════════════ */}
      <CategoryBrandShowcase />

      {/* ═══════════════════════════════════════════════════════════
          TERRITORY GROWN — From Our Territory showcase
          Indigenous sovereignty, locally cultivated products
          ═══════════════════════════════════════════════════════════ */}
      <TerritoryGrownSection />

      {/* ═══════════════════════════════════════════════════════════
          NEW ARRIVALS — Latest products added to the collection
          Conversion: Novelty, Discovery, FOMO
          ═══════════════════════════════════════════════════════════ */}
      <NewArrivals />

      {/* ═══════════════════════════════════════════════════════════
          MONTHLY DEALS — .cc gradient deal cards (green/amber/purple)
          Conversion: Anchoring, Category Entry Points
          ═══════════════════════════════════════════════════════════ */}
      <MonthlyDeals />

      {/* ═══════════════════════════════════════════════════════════
          MIX & MATCH CTA — Build Your Own Ounce promo banner
          Conversion: Customization, Value Anchoring, Bundle Discount
          ═══════════════════════════════════════════════════════════ */}
      <MixMatchCTA />

      {/* ═══════════════════════════════════════════════════════════
          DEAL OF THE DAY — Featured daily deal with large countdown
          Conversion: Urgency, Scarcity, Loss Aversion, Anchoring
          ═══════════════════════════════════════════════════════════ */}
      <DealOfTheDay />

      {/* ═══════════════════════════════════════════════════════════
          DEALS SECTION — Bento deals with countdown + anchor pricing
          Conversion: Anchoring, Scarcity (countdown), Loss Aversion
          ═══════════════════════════════════════════════════════════ */}
      <DealsSection />

      {/* ═══════════════════════════════════════════════════════════
          FEATURED PRODUCTS — Bento Grid (kept from Vercel)
          ═══════════════════════════════════════════════════════════ */}
      <BentoGrid />

      {/* ═══════════════════════════════════════════════════════════
          TRUST PILLARS — Why choose Mohawk Medibles
          Conversion: Authority, Reciprocity, Risk Reversal
          ═══════════════════════════════════════════════════════════ */}
      <TrustPillars />

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — .cc 3-step process (Browse → Pay → Deliver)
          Conversion: Cognitive Ease, Friction Reduction
          ═══════════════════════════════════════════════════════════ */}
      <HowItWorks />

      {/* ═══════════════════════════════════════════════════════════
          CUSTOMER TESTIMONIALS — .cc review cards with avatars
          Conversion: Social Proof, Trust
          ═══════════════════════════════════════════════════════════ */}
      <CustomerTestimonials />

      {/* ═══════════════════════════════════════════════════════════
          GOOGLE REVIEWS — Live Google reviews carousel + rating badge
          Conversion: Third-party Social Proof, Trust (Google verified)
          ═══════════════════════════════════════════════════════════ */}
      <GoogleReviewsWidget />

      {/* ═══════════════════════════════════════════════════════════
          STORE PROMO — Visit our physical location + Click & Collect
          Conversion: Local Trust, Omnichannel, Pickup Convenience
          ═══════════════════════════════════════════════════════════ */}
      <StorePromo />

      {/* ═══════════════════════════════════════════════════════════
          REVIEW CAROUSEL — Social proof scrolling reviews
          Conversion: Social Proof, Commitment/Consistency
          ═══════════════════════════════════════════════════════════ */}
      <ReviewCarousel />

      {/* ═══════════════════════════════════════════════════════════
          STICKY MOBILE NAV — Bottom bar for mobile (md:hidden)
          Conversion: Fogg Model (reduce friction on mobile)
          ═══════════════════════════════════════════════════════════ */}
      <StickyMobileNav />
    </div>
  );
}
