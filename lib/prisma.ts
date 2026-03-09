let PrismaClientClass: any;
try {
    PrismaClientClass = require("@prisma/client").PrismaClient;
} catch {
    PrismaClientClass = null;
}

const globalForPrisma = globalThis as unknown as { prisma: any };

// Model-level proxy: prisma.dispensary.findMany() → []
const modelProxy = new Proxy(
    {},
    {
        get(_target, method) {
            if (method === "then") return undefined; // Not a thenable
            // Return an async function for any Prisma method
            return (..._args: any[]) => {
                if (method === "count") return Promise.resolve(0);
                if (method === "findUnique" || method === "findFirst") return Promise.resolve(null);
                // findMany, groupBy, aggregate, etc. → return empty array
                return Promise.resolve([]);
            };
        },
    }
);

// Top-level proxy: prisma.dispensary → modelProxy
const noopPrisma = new Proxy(
    {},
    {
        get(_target, prop) {
            if (prop === "then") return undefined;
            if (prop === "$connect" || prop === "$disconnect") {
                return () => Promise.resolve();
            }
            return modelProxy;
        },
    }
);

function createPrismaClient() {
    if (!PrismaClientClass) return noopPrisma;
    try {
        return new PrismaClientClass();
    } catch {
        return noopPrisma;
    }
}

export const prisma =
    globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
