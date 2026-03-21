/**
 * Root tRPC Router — Combines all sub-routers
 * This is the single entry point for all tRPC procedures.
 */
import { router } from "./trpc";
import { posRouter } from "./routers/pos";
import { inventoryRouter } from "./routers/inventory";
import { reportingRouter } from "./routers/reporting";
import { teamRouter } from "./routers/team";
import { rewardsRouter } from "./routers/rewards";
import { restockAlertsRouter } from "./routers/restockAlerts";
import { reviewRequestsRouter } from "./routers/reviewRequests";
import { reviewIncentivesRouter } from "./routers/reviewIncentives";
import { customerSegmentsRouter } from "./routers/customerSegments";
import { subscriptionsRouter } from "./routers/subscriptions";

export const appRouter = router({
  pos: posRouter,
  inventory: inventoryRouter,
  reporting: reportingRouter,
  team: teamRouter,
  rewards: rewardsRouter,
  restockAlerts: restockAlertsRouter,
  reviewRequests: reviewRequestsRouter,
  reviewIncentives: reviewIncentivesRouter,
  customerSegments: customerSegmentsRouter,
  subscriptions: subscriptionsRouter,
});

export type AppRouter = typeof appRouter;
