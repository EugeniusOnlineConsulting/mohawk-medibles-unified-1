# Mohawk Medibles — AI Innovation Blueprint V2.0
## Maximum Autonomous AI-Driven E-Commerce System
### Generated 2026-02-12 | GLORIS Architecture Division

> **See also:** [MOHAWK_MEDIBLES_MASTER_BLUEPRINT.md](./MOHAWK_MEDIBLES_MASTER_BLUEPRINT.md) — Integrated blueprint with V1 platform + V2 AI systems + $1M revenue engine + agent directives + financial model

---

## 1. V1 AUDIT — WHAT WE HAVE (92% Production Ready)

### Current Architecture Summary
| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 | ✅ Built |
| Backend | Next.js API Routes (30+ endpoints) | ✅ Built |
| Database | PostgreSQL + Prisma 7 (31 models) | ✅ Built |
| AI Engine | 3-Tier MedAgent (Turbo/Flash/Pro via Gemini) | ✅ Built |
| Agents | 7 Python agents via FastAPI Gateway :8000 | ✅ Built |
| Payments | Stripe + Google Pay + UCP Protocol | ✅ Built |
| Fulfilment | ShipStation webhooks + tracking | ✅ Built |
| Email | Resend + Campaign Agent + Newsletter Agent | ✅ Built |
| SEO | AEO, backlinks, competitor gap, local SEO, geo | ✅ Built |
| Auth | PBKDF2 + JWT sessions + RBAC (5 roles) | ✅ Built |
| Security | CAPTCHA, rate limiting, HMAC webhooks, CSP | ✅ Built |
| Data | WooCommerce SSH extraction → seed pipeline | ✅ Built |
| Commerce | Server-side cart, checkout intent, fuzzy search | ✅ Built |
| Voice | WebSocket chat widget + voice agent hooks | ✅ Built |
| Content | 5-pillar content engine + brand voice system | ✅ Built |

### V1 Gaps Identified
| Gap | Impact | Priority |
|-----|--------|----------|
| Keyword routing in gateway (if/elif chain) | Missed intents, no context awareness | CRITICAL |
| Memory Service is basic JSON file | No long-term personalisation | HIGH |
| No autonomous decision loop | Agents reactive only, not proactive | HIGH |
| No predictive inventory | Manual stock monitoring | HIGH |
| Single-session cart (in-memory Map) | Cart lost on server restart | MEDIUM |
| No A/B testing engine | Can't optimise conversions | MEDIUM |
| No real-time analytics feedback | No self-improving system | MEDIUM |
| Content agent generates but doesn't publish | Manual step required | MEDIUM |
| No customer journey orchestration | Touchpoints not coordinated | MEDIUM |
| No voice-to-order completion rate tracking | Can't measure agent effectiveness | LOW |

---

## 2. THE INNOVATION LIFT — 7 AUTONOMOUS AI SYSTEMS

### SYSTEM 1: Neural Intent Router (Replaces Keyword Matching)

**Current:** `if "stock" in data.lower()` keyword matching in `core_gateway.py`
**Upgrade:** Semantic intent classification with confidence scoring

```
Architecture:
  User Message → Embedding Model (local) → Intent Classifier
                                          ↓
                                  [confidence > 0.85] → Direct Route
                                  [confidence 0.5-0.85] → Clarification
                                  [confidence < 0.5] → Gemini Pro reasoning
```

**What it does:**
- Replaces the brittle if/elif chain with vector-based intent matching
- Handles ambiguous queries: "do you have that purple stuff" → Stock Agent + Product Search
- Multi-intent detection: "check my order and recommend something similar" → Logistics + CRM + Recommendation
- Context carry-over: remembers the conversation thread across messages
- Confidence-based escalation: uncertain queries get routed to reasoning model

**New intents to add:**
- `REORDER` — "same as last time" → pull order history, pre-fill cart
- `COMPARE` — "what's stronger, X or Y" → product comparison engine
- `EDUCATE` — "what are terpenes" → educational content delivery
- `COMPLAIN` — sentiment detection → priority support escalation
- `GIFT` — "gift for someone who likes edibles" → gift recommendation engine

---

### SYSTEM 2: Autonomous Operations Loop (The Brain)

**Current:** All agents are reactive — they respond when asked
**Upgrade:** Proactive autonomous decision engine that runs 24/7

```
Architecture:
  ┌─────────────────────────────────────────────┐
  │           AUTONOMOUS OPS LOOP               │
  │  (Python daemon, runs every 15 minutes)     │
  │                                             │
  │  1. SENSE  → Pull all system metrics        │
  │  2. THINK  → AI analyses patterns           │
  │  3. ACT    → Execute decisions              │
  │  4. LEARN  → Record outcomes                │
  └─────────────────────────────────────────────┘
```

**Autonomous actions it takes:**
| Trigger | Action | Agent |
|---------|--------|-------|
| Inventory < threshold | Auto-generate restock alert + supplier email | Stock Agent |
| Cart abandonment > 1hr | Send personalised recovery email | Campaign Agent |
| Customer dormant > 30 days | Trigger win-back sequence | CRM Agent |
| New review (negative) | Auto-escalate to support + draft response | Support Agent |
| Trending search term detected | Generate blog post + social content | Content Agent |
| Conversion rate drops > 10% | A/B test new hero copy, adjust pricing display | Optimisation Agent |
| VIP customer browsing | Push personalised notification | CRM Agent |
| Weekend approaching | Schedule weekend promo campaign | Campaign Agent |
| Low-stock product selling fast | Increase price 5%, add urgency badge | Stock + Pricing Agent |

**Decision confidence levels:**
- **AUTO-EXECUTE** (score > 0.9): Cart recovery emails, low-stock alerts, review responses
- **DRAFT-AND-QUEUE** (0.7-0.9): Blog posts, campaigns, pricing changes
- **HUMAN-APPROVE** (< 0.7): Discounts > 20%, new product listings, refunds > $100

---

### SYSTEM 3: Predictive Intelligence Engine

**Current:** No predictive capabilities
**Upgrade:** ML-powered forecasting for inventory, demand, and customer behaviour

```
Architecture:
  Historical Data (orders, traffic, weather, events)
       ↓
  Feature Engineering Pipeline
       ↓
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  Demand       │  │  Customer    │  │  Price       │
  │  Forecaster   │  │  Churn       │  │  Optimiser   │
  │  (7/30/90 day)│  │  Predictor   │  │  (Dynamic)   │
  └──────────────┘  └──────────────┘  └──────────────┘
       ↓                   ↓                 ↓
  Auto-reorder         Win-back           Margin
  suggestions          triggers           maximisation
```

**Capabilities:**
1. **Demand Forecasting** — Predict which products will sell out in 7/30/90 days based on:
   - Historical order velocity
   - Day-of-week patterns
   - Seasonal trends (4/20, holidays, pay cycles)
   - Category momentum (edibles trending up, flower stable)

2. **Churn Prediction** — Score every customer 0-100 on likelihood to churn:
   - Days since last order
   - Order frequency decline
   - Browse-but-don't-buy pattern
   - Support ticket history
   - Triggers automated win-back at score > 70

3. **Dynamic Pricing Intelligence** — NOT automatic price changes, but smart suggestions:
   - Products with high demand + low stock → suggest price increase
   - Slow movers → suggest bundle deals
   - Competitor price monitoring → alert when we're significantly over/under
   - Margin-optimised coupon suggestions

---

### SYSTEM 4: Hyper-Personalisation Engine

**Current:** Basic preference tracking (indica/sativa) in JSON file
**Upgrade:** Real-time personalisation across every customer touchpoint

```
Architecture:
  Customer Actions → Event Stream → Profile Builder
       ↓
  ┌─────────────────────────────────────┐
  │     CUSTOMER GENOME                  │
  │                                      │
  │  Preferences: indica, edibles, CBD   │
  │  Price Tier: premium ($40-80)        │
  │  Browse Pattern: evening, mobile     │
  │  Purchase Cycle: every 14 days       │
  │  Flavour Profile: fruity, earthy     │
  │  THC Tolerance: moderate (15-22%)    │
  │  Content Interest: education, science│
  │  Channel Pref: email > chat > voice  │
  │  Segment: VIP, Repeat, Flower-lover  │
  │  Predicted Next Order: Feb 18        │
  │  Recommended: [product IDs]          │
  └─────────────────────────────────────┘
```

**Database additions needed (new Prisma models):**
```prisma
model CustomerProfile {
    id              String   @id @default(cuid())
    userId          String   @unique
    preferences     Json     // { strain: "indica", flavour: ["fruity"] }
    priceTier       String?  // budget, mid, premium
    browsePattern   Json?    // { dayOfWeek: [5,6], timeOfDay: "evening" }
    purchaseCycle   Int?     // avg days between orders
    thcTolerance    String?  // low, moderate, high
    contentInterest String[] // ["education", "product_story"]
    channelPref     String?  // email, chat, voice, sms
    churnScore      Float    @default(0)
    nextOrderDate   DateTime?
    recommendations Json?    // [{ productId, score, reason }]
    updatedAt       DateTime @updatedAt
    user            User     @relation(fields: [userId], references: [id])
}

model CustomerEvent {
    id        String   @id @default(cuid())
    userId    String
    type      String   // page_view, add_to_cart, purchase, search, chat
    data      Json     // { productId, query, page, etc }
    createdAt DateTime @default(now())
    @@index([userId, type])
    @@index([createdAt])
}
```

**Personalisation touchpoints:**
| Touchpoint | What Changes | How |
|-----------|-------------|-----|
| Homepage hero | Shows preferred category | CustomerProfile.preferences |
| Product recommendations | "Based on your taste" | Collaborative filtering |
| Search results ranking | Preferred categories first | CustomerProfile.preferences |
| Email campaigns | Personalised product picks | CRM + CustomerProfile |
| Chat agent greeting | "Welcome back! Your usual Indica?" | Memory + CustomerProfile |
| Checkout upsells | Complementary products | Purchase history analysis |
| Push notifications | "Your favourite strain is back in stock" | Inventory + Preferences |
| Reorder timing | "Time to restock?" email | purchaseCycle prediction |

---

### SYSTEM 5: Conversational Commerce 2.0

**Current:** WebSocket chat with Gemini Flash/Pro, basic cart management
**Upgrade:** Full agentic commerce with multi-modal input and order completion

```
Architecture:
  ┌────────────────────────────────────────────┐
  │  CONVERSATIONAL COMMERCE 2.0                │
  │                                             │
  │  Voice ─┐                                   │
  │  Chat  ─┤→ Neural Router → Agent Executor   │
  │  Image ─┘    ↕              ↕               │
  │         Context Memory    Action Engine      │
  │              ↕              ↕               │
  │         Session Store   Stripe/ShipStation   │
  └────────────────────────────────────────────┘
```

**New capabilities:**
1. **Image-Based Search** — Customer sends photo → Gemini Vision identifies product → suggests matches
2. **Reorder by Voice** — "Same as last time" → pulls order history → one-click reorder
3. **Bundle Builder** — "I want something for a party" → AI curates bundle with discount
4. **Product Comparison** — "What's the difference between X and Y?" → side-by-side comparison card
5. **Guided Discovery** — "I'm new to cannabis" → 5-question quiz → personalised starter pack
6. **Order Tracking Proactive** — Agent messages customer when status changes (not just when asked)
7. **Persistent Cart** — Move cart from in-memory Map to database-backed (survives restarts)
8. **Multi-Step Checkout** — Agent guides through checkout conversationally:
   - "Ready to checkout?" → Confirm items → Confirm address → Payment → Confirmation
9. **Post-Purchase Flow** — After order: "How was your experience with [product]?" → Review collection

---

### SYSTEM 6: Autonomous Content & SEO Engine

**Current:** Content agent generates content, but requires manual publishing
**Upgrade:** Full autonomous content lifecycle from research to publication to performance tracking

```
Architecture:
  Keyword Research (auto)
       ↓
  Content Calendar (AI-planned)
       ↓
  Content Generation (brand voice)
       ↓
  Quality Gate (brand validator)
       ↓
  Auto-Publish (scheduled)
       ↓
  Performance Tracking
       ↓
  Optimisation Loop (update underperformers)
```

**Autonomous capabilities:**
1. **Auto-SEO Research** — Weekly keyword gap analysis against competitors
2. **Content Calendar** — AI plans 30 days ahead based on:
   - Seasonal events (4/20, Black Friday, Canada Day)
   - Product launches
   - Trending searches in cannabis space
   - Content pillar balance (education 30%, product 25%, heritage 15%, etc.)
3. **Auto-Generation** — Blog posts, social captions, email campaigns, GMB posts
4. **Brand Validator** — Every piece runs through compliance checker:
   - No medical claims without disclaimers
   - No pricing in social media (Facebook compliance)
   - No competitor bashing
   - Heritage authenticity check
5. **Auto-Publish Pipeline**:
   - Blog → Next.js CMS (draft → review queue → publish)
   - Social → Buffer/Later API integration
   - Email → Resend via Campaign Agent
   - GMB → Google Business Profile API
6. **Performance Loop** — Track views, engagement, conversions per piece:
   - Underperformers get auto-updated titles/descriptions
   - Top performers get extended/repurposed across channels
   - A/B test headlines on blog posts

---

### SYSTEM 7: Real-Time Business Intelligence Dashboard

**Current:** Basic admin stats endpoint
**Upgrade:** Live AI-powered business intelligence with anomaly detection

```
Architecture:
  All Data Sources → Event Stream → Analytics Engine
       ↓
  ┌─────────────────────────────────────────────┐
  │  REAL-TIME BI DASHBOARD                      │
  │                                              │
  │  Revenue     │  Orders      │  Inventory     │
  │  ████████░   │  ▲ 12 today  │  ⚠ 3 low      │
  │  $4,200/day  │  AOV: $156   │  0 out         │
  │              │              │                │
  │  Customers   │  AI Agent    │  Campaigns     │
  │  142 active  │  87% resolve │  32% open rate │
  │  12 at-risk  │  2.1s avg    │  4.2% click    │
  │              │              │                │
  │  ANOMALIES   │  PREDICTIONS │  ACTIONS       │
  │  ⚠ Spike in  │  Demand ↑    │  ✅ Sent 3     │
  │  cart abandon│  for edibles │  recovery mails│
  └─────────────────────────────────────────────┘
```

**AI-powered features:**
1. **Anomaly Detection** — Alert when any metric deviates > 2 standard deviations
2. **Natural Language Queries** — Admin asks: "Why did revenue drop Tuesday?" → AI analyses
3. **Predictive KPIs** — Show projected revenue for rest of month based on current trajectory
4. **Agent Performance** — Track MedAgent: resolution rate, avg response time, conversion rate
5. **Customer Health Score** — Aggregate churn risk across entire customer base
6. **Automated Reports** — Daily/weekly email digest to admin with AI commentary
7. **Recommendation Engine** — Dashboard suggests next best actions based on data patterns

---

## 3. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2) — "Smart Autonomy"
| Task | Files Affected | Effort |
|------|---------------|--------|
| Persistent cart (DB-backed) | `lib/sage/commerce.ts`, `prisma/schema.prisma` | 2hr |
| CustomerProfile + CustomerEvent models | `prisma/schema.prisma` | 1hr |
| Event tracking middleware | New: `lib/events.ts` | 3hr |
| Neural Intent Router (replace if/elif) | `agents/core_gateway.py` | 4hr |
| Cart recovery email trigger | `agents/campaign_agent.py` | 2hr |
| Persistent memory service (DB-backed) | `agents/skills/memory_service.py` | 3hr |

### Phase 2: Autonomous Loop (Week 2-3) — "The Brain"
| Task | Files Affected | Effort |
|------|---------------|--------|
| Autonomous ops daemon | New: `agents/autonomous_loop.py` | 6hr |
| Decision confidence framework | New: `agents/decision_engine.py` | 4hr |
| Proactive notifications (order status) | `agents/logistics_agent.py`, `lib/email.ts` | 3hr |
| Auto-escalation for negative reviews | `agents/support_agent.py` | 2hr |
| Win-back auto-trigger on churn score | `agents/crm_agent.py` | 2hr |

### Phase 3: Personalisation (Week 3-4) — "Know Every Customer"
| Task | Files Affected | Effort |
|------|---------------|--------|
| Customer genome builder | New: `lib/personalisation.ts` | 5hr |
| Recommendation engine (collaborative filtering) | New: `lib/recommendations.ts` | 6hr |
| Personalised homepage | `app/page.tsx`, `components/` | 4hr |
| Personalised search ranking | `lib/products.ts` | 2hr |
| Reorder prediction + email | `agents/crm_agent.py`, `lib/email.ts` | 3hr |

### Phase 4: Predictive Intelligence (Week 4-5) — "See the Future"
| Task | Files Affected | Effort |
|------|---------------|--------|
| Demand forecasting model | New: `agents/forecasting.py` | 8hr |
| Churn prediction scorer | New: `agents/churn_predictor.py` | 6hr |
| Dynamic pricing suggestions | New: `agents/pricing_agent.py` | 4hr |
| Anomaly detection on metrics | New: `lib/anomaly.ts` | 4hr |

### Phase 5: Content Autonomy (Week 5-6) — "Self-Publishing"
| Task | Files Affected | Effort |
|------|---------------|--------|
| Content calendar automation | `agents/content_agent.py` | 4hr |
| Brand validator (compliance check) | New: `agents/brand_validator.py` | 3hr |
| Auto-publish pipeline (blog + GMB) | New: `agents/publisher.py` | 5hr |
| Performance tracking + optimisation loop | New: `lib/content-analytics.ts` | 4hr |

### Phase 6: BI Dashboard (Week 6-7) — "Command Centre"
| Task | Files Affected | Effort |
|------|---------------|--------|
| Real-time metrics aggregator | New: `lib/analytics-engine.ts` | 5hr |
| AI-powered natural language queries | New: `app/api/admin/ai-query/route.ts` | 4hr |
| Anomaly detection alerts | Extend `agents/autonomous_loop.py` | 3hr |
| Automated daily/weekly reports | New: `agents/reporting_agent.py` | 4hr |
| Admin dashboard upgrade (live widgets) | `app/admin/page.tsx`, `components/admin/` | 6hr |

---

## 4. TECH STACK ADDITIONS

| Technology | Purpose | Why |
|-----------|---------|-----|
| Redis | Session cache, cart persistence, event queue | Fast in-memory for real-time ops |
| BullMQ | Job queue for autonomous tasks | Reliable background processing |
| Sentence-Transformers | Intent embeddings | Local, fast, free semantic matching |
| scikit-learn | Demand forecasting, churn prediction | Lightweight ML (no GPU needed) |
| Cron/systemd | Autonomous loop scheduling | Reliable daemon management |
| PostHog or Plausible | Privacy-first analytics | GDPR-compliant event tracking |

---

## 5. MOAT ANALYSIS — WHY THIS IS UNBEATABLE

### What competitors have:
- ❌ Static product pages with basic search
- ❌ Manual inventory management
- ❌ Generic email blasts
- ❌ No AI agents
- ❌ No personalisation

### What Mohawk Medibles V2 will have:
- ✅ 7 AI agents that work 24/7 autonomously
- ✅ Predictive inventory that never runs out
- ✅ Hyper-personalised shopping for every customer
- ✅ Conversational commerce with voice + image search
- ✅ Self-publishing content engine with SEO optimisation
- ✅ Real-time BI dashboard with anomaly detection
- ✅ Autonomous decision loop that gets smarter over time
- ✅ Google UCP protocol (future-proof for Google Shopping AI)

### Revenue Impact Projections:
| Innovation | Projected Monthly Impact |
|-----------|------------------------|
| Cart recovery automation | +$800-1,200/mo (recovering 15-20% of abandoned carts) |
| Personalised recommendations | +$600-1,000/mo (increasing AOV by 12-18%) |
| Win-back campaigns (auto) | +$400-700/mo (reactivating 8-12% dormant) |
| Content SEO autonomy | +$300-500/mo (organic traffic growth 15-25%) |
| Predictive reorder emails | +$500-800/mo (increasing repeat rate 10-15%) |
| Dynamic pricing suggestions | +$200-400/mo (margin optimisation 3-5%) |
| **TOTAL PROJECTED LIFT** | **+$2,800-4,600/mo** |

---

## 6. IMMEDIATE NEXT ACTIONS

1. **Start Phase 1** — Add CustomerProfile/CustomerEvent models to Prisma schema
2. **Replace keyword router** — Neural intent router in core_gateway.py
3. **Persistent cart** — Move from in-memory Map to PostgreSQL
4. **Event tracking** — Instrument all customer actions for personalisation data
5. **Autonomous loop skeleton** — Set up the 15-minute sense-think-act cycle

---

*This blueprint transforms Mohawk Medibles from a well-built e-commerce platform into a self-operating, self-optimising AI commerce engine. The V1 foundation is solid — the V2 lift makes it autonomous.*

**GLORIS Architecture Division | Mohawk Medibles Innovation Lift V2.0**
