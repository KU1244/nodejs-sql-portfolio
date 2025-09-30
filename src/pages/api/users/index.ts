// src/pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/result";
import { withJson } from "@/lib/http";
import { getAuthUserFromRequest } from "@/lib/auth";
import { UserCreate } from "@/lib/validation/user";
import { Prisma } from "@prisma/client";

/**
 * Unified handler for:
 * - GET /api/users   : list users (optionally with ?limit=)
 * - POST /api/users  : create user (ownerId is injected on the server)
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    // Simple demo auth via headers. Replace with session/JWT in real apps.
    const me = getAuthUserFromRequest(req);
    if (!me) {
        res.status(403).json(fail("forbidden", "No auth headers"));
        return;
    }

    if (req.method === "GET") {
        // Parse limit safely; cap to 100; default 20 on invalid values
        const raw = Number(req.query.limit ?? 20);
        const limit = Number.isFinite(raw) ? Math.min(raw, 100) : 20;

        // Whitelist fields
        const users = await prisma.user.findMany({
            take: limit,
            orderBy: { id: "asc" },
            select: { id: true, name: true, email: true, ownerId: true },
            // If you want per-owner isolation, uncomment:
            // where: { ownerId: me.id },
        });

        res.status(200).json(ok(users));
        return;
    }

    if (req.method === "POST") {
        // Validate only client-allowed fields (name, email)
        const parsed = UserCreate.safeParse(req.body as unknown);
        if (!parsed.success) {
            // Use flatten() output for structured error details
            const details = parsed.error.flatten((i) => i.message);
            res.status(400).json(fail("bad_request", "Invalid body", details));
            return;
        }

        const { name, email } = parsed.data;

        try {
            // Security: ownerId comes from authenticated user, not from client
            const created = await prisma.user.create({
                data: { name, email, ownerId: me.id },
                select: { id: true, name: true, email: true, ownerId: true },
            });

            res.setHeader("Location", `/api/users/${created.id}`);
            res.status(201).json(ok(created));
            return;
        } catch (e) {
            // Map unique constraint to 409 Conflict
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                res.status(409).json(fail("conflict", "Email already used"));
                return;
            }
            throw e; // Let withJson handle 500
        }
    }
}

export default withJson(handler, ["GET", "POST"] as const);

// Optional: mildly larger limit for demo payloads
export const config = { api: { bodyParser: { sizeLimit: "500kb" } } };
