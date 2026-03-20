/**
 * Root tRPC Router — Combines all sub-routers
 * This is the single entry point for all tRPC procedures.
 */
import { router } from "./trpc";
import { posRouter } from "./routers/pos";
import { inventoryRouter } from "./routers/inventory";
import { reportingRouter } from "./routers/reporting";
import { teamRouter } from "./routers/team";

export const appRouter = router({
  pos: posRouter,
  inventory: inventoryRouter,
  reporting: reportingRouter,
  team: teamRouter,
});

export type AppRouter = typeof appRouter;
