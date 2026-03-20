# MERGE MISSION: Upgrade MohawkMedibles_SEO_v1.0 to Unified Platform

## STRATEGY
This codebase (mohawkmedibles.co) is the STRONGEST base. DO NOT rebuild from scratch.
Instead, MERGE IN the best features from Ian's two repos.

## WHAT THIS CODEBASE ALREADY HAS (DON'T REBUILD)
- Next.js 16 + Prisma + Neon PostgreSQL (mature schema)
- WooCommerce sync engine (25,918 customers, 40,771 orders, 344 products)
- MedAgent AI assistant (lib/sage/ — 3-tier Gemini routing, personas, memory, voice, behavioral)
- Multi-tenant system (middleware.ts + lib/tenant.ts + TenantProvider)
- SEO infrastructure (schema markup, meta, structured data)
- 10 WC webhooks (real-time sync)
- 4 cron jobs
- Payment proxy (PayGo CC, Interac e-Transfer, Crypto)
- Checkout system
- AgentChatWidget component
- Product data pipeline (lib/wc-api.ts)
- Admin split-test dashboard

## WHAT TO MERGE FROM IAN'S MOHAWK-MEDIBLES (.cc)
Source: ~/projects/clients/mohawk-medibles-merge/ian-mohawk-medibles/ (branch: nextjs)

### HIGH PRIORITY — Port These:
1. **79+ Section Admin Dashboard** — Read src/app/admin/ thoroughly, port the admin layout + all section pages
2. **Cart System** — Native cart with add/remove/update, cart recovery automation (their cart is more mature than WC proxy)
3. **Digipay Payment Integration** — Direct e-transfer + crypto postback at /api/digipay/postback/
4. **Security Headers** — CSP, HSTS, CORS, Permissions-Policy, X-Frame-Options from next.config.ts
5. **Age Gate** — Cannabis compliance age verification component
6. **Cookie Consent** — GDPR/PIPEDA compliant consent banner
7. **Flash Sale Pages** — src/app/flash-sale/ (dedicated flash sale system)
8. **Gift Cards** — src/app/gift-cards/ (gift card purchase + redemption)
9. **Brand Pages** — src/app/brands/ (brand directory)
10. **Cart Recovery Cron** — /api/cron/cart-recovery/ (abandoned cart emails)
11. **Review Request Cron** — /api/cron/review-requests/ (post-purchase review solicitation)
12. **Service Worker** — sw.js for offline caching
13. **How-to-Order Page** — src/app/how-to-order/
14. **Contact Page** — src/app/contact/
15. **Our Story Page** — src/app/our-story/
16. **FAQ Page** — src/app/faq/
17. **Analytics Tracking** — /api/track/ endpoint

### MERGE APPROACH for .cc Features:
- Read Ian's implementation first, understand the patterns
- Adapt to use Prisma (not Drizzle) and our existing DB schema
- Add new Prisma models as needed (Cart, CartItem, GiftCard, FlashSale, etc.)
- Keep our existing components/lib intact — ADD new files alongside
- Use our existing UI patterns (Tailwind 4 + our component library)

## WHAT TO MERGE FROM COMMAND CENTER
Source: ~/projects/clients/mohawk-medibles-merge/ian-command-center/

### HIGH PRIORITY — Port These:
1. **POS System** — server/routers/pos/posRouter.ts → convert to tRPC + Prisma
   - Transaction management, cart, cash drawer, shift management
   - Port as /admin/pos/ pages + /api/trpc/ routes
2. **Inventory Management** — server/routers/inventory/
   - Products, warehouses, purchase orders, sales orders
   - Stock adjustments, demand forecasting, automation
   - Port as /admin/inventory/ pages
3. **BI Reporting** — server/routers/reporting/
   - Unified reports, scheduled reports
   - Recharts dashboards
   - Port as /admin/analytics/ pages
4. **Team Management** — Custom roles, invites, role history
   - Port as /admin/team/ pages
5. **Multi-site Monitoring** — server/routers/sites/siteMonitorRouter.ts
   - Port as /admin/sites/ page

### MERGE APPROACH for Command Center:
- This is Express + tRPC + MySQL → convert to Next.js API routes + tRPC + Prisma PostgreSQL
- Read the Drizzle schema at drizzle/schema.ts → add missing models to our Prisma schema
- Read the tRPC routers → recreate as tRPC routers in our app using Prisma
- Read the Vite frontend pages → recreate as Next.js App Router pages
- Keep the Recharts dashboard components (they're React, portable)

## UNIFIED PRISMA SCHEMA ADDITIONS
After reading all three Drizzle schemas, add these model groups to prisma/schema.prisma:

### From .cc (Ian's mohawk-medibles):
- Cart / CartItem (native cart, not WC proxy)
- GiftCard / GiftCardTransaction
- FlashSale / FlashSaleProduct
- Review / ReviewRequest
- CookieConsent / AgeVerification logs
- AnalyticsEvent (tracking)

### From Command Center:
- PosTransaction / PosTransactionItem
- CashDrawer / CashDrawerLog
- Shift / ShiftLog
- Warehouse / WarehouseProduct
- PurchaseOrder / PurchaseOrderItem
- SalesOrder / SalesOrderItem
- StockAdjustment
- DemandForecast
- ScheduledReport
- Team / TeamMember / TeamInvite
- CustomRole / RolePermission
- SiteMonitor

## DOMAIN ROUTING (Update proxy.ts / middleware.ts)
- mohawkmedibles.ca → primary storefront (the production site)
- mohawkmedibles.co → SEO variant / redirect to .ca
- mohawkmedibles.cc → admin panel / command center (/admin/*)
- All domains serve same codebase, domain routing controls what's visible

## UI/UX ENHANCEMENTS
- Dark theme: bg #1e1e26, accent lime-green #C8E63E (from .cc)
- Port dark/light theme toggle
- Age gate overlay (mandatory for first visit)
- Cookie consent banner
- Floating MedAgent chat widget (already exists, keep it)
- Admin sidebar with 79+ sections
- POS full-screen terminal mode
- Recharts BI dashboards
- Mobile-first responsive throughout

## EXECUTION ORDER

### Phase 1: Schema & Infrastructure (DO FIRST)
1. Read ALL three Drizzle schemas thoroughly
2. Add new Prisma models to existing schema.prisma
3. Run prisma migrate dev to create new tables
4. Set up tRPC (install @trpc/server @trpc/client @trpc/react-query @trpc/next)
5. Create server/trpc/ directory with context + router skeleton
6. Add security headers to next.config.ts (from .cc)
7. Update proxy.ts/middleware.ts for 3-domain routing

### Phase 2: Cart & Payments
8. Port native cart system from .cc (replace WC proxy cart)
9. Port Digipay payment integration
10. Keep existing PayGo + crypto payment methods
11. Merge checkout flow (best of both)
12. Add cart recovery cron job

### Phase 3: Admin Dashboard
13. Port admin layout + navigation (79+ sections) from .cc
14. Port admin pages that don't exist in our codebase
15. Keep our existing admin pages (split-test, tenants)
16. Add MedAgent config panel to admin

### Phase 4: Command Center Integration
17. Port POS tRPC routers → our tRPC setup
18. Port inventory tRPC routers
19. Port BI/reporting routers
20. Port team management routers
21. Create admin pages for POS, inventory, analytics, team

### Phase 5: Storefront Enhancements
22. Port flash sale system from .cc
23. Port gift cards from .cc
24. Port brand pages from .cc
25. Port how-to-order, contact, our-story, FAQ pages
26. Add age gate + cookie consent components
27. Add service worker
28. Port review request system + cron

### Phase 6: Polish & Deploy
29. Add dark/light theme toggle
30. Lighthouse optimization
31. Test all payment flows
32. Test WC webhook sync still works
33. Test MedAgent works with new schema
34. Deploy to Vercel
35. Configure .ca domain as primary
