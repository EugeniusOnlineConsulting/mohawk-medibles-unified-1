/**
 * tRPC API Route Handler — Next.js App Router
 * Handles all /api/trpc/* requests.
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/root";
import { createTRPCContext } from "@/server/trpc/trpc";
import { headers } from "next/headers";

async function handler(req: Request) {
  const headersList = await headers();

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        userId: headersList.get("x-user-id"),
        userRole: headersList.get("x-user-role"),
        userEmail: headersList.get("x-user-email"),
      }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`❌ tRPC error on ${path ?? "<no-path>"}: ${error.message}`);
          }
        : undefined,
  });
}

export { handler as GET, handler as POST };
