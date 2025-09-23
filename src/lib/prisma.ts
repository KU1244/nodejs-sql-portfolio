// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton for Next.js (avoids multiple instances during hot reloads).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ["query", "error", "warn"], // You may tune logs for portfolio demos
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
