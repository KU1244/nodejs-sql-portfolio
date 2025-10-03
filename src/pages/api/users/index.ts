import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/result";
import { withJson } from "@/lib/http";
import { getAuthUserFromRequest } from "@/lib/auth";
import { UserCreate } from "@/lib/validation/user";
import { Prisma } from "@prisma/client"; // Use Prisma namespace for error handling

/**
 * API Handler for /api/users
 *
 * Supported methods:
 * - GET  /api/users   → List users (optional ?limit=N)
 * - POST /api/users   → Create a new user (server injects ownerId)
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const me = getAuthUserFromRequest(req);
    if (!me) {
        res.status(403).json(fail("forbidden", "No auth headers provided"));
        return;
    }

    if (req.method === "GET") {
        // Parse and sanitize "limit" query param
        const raw = Number(req.query.limit ?? 20);
        const limit = Number.isFinite(raw) ? Math.min(raw, 100) : 20;

        // Fetch users with whitelisted fields only
        const users = await prisma.user.findMany({
            take: limit,
            orderBy: { id: "asc" },
            select: { id: true, name: true, email: true, ownerId: true },
        });

        res.status(200).json(ok(users));
        return;
    }

    if (req.method === "POST") {
        // Validate request body (only "name" and "email" allowed)
        const parsed = UserCreate.safeParse(req.body as unknown);
        if (!parsed.success) {
            const details = parsed.error.flatten((i) => i.message);
            res.status(400).json(fail("bad_request", "Invalid body format", details));
            return;
        }

        const { name, email } = parsed.data;

        try {
            // Create new user, ownerId comes from authenticated user
            const created = await prisma.user.create({
                data: { name, email, ownerId: me.id },
                select: { id: true, name: true, email: true, ownerId: true },
            });

            res.setHeader("Location", `/api/users/${created.id}`);
            res.status(201).json(ok(created));
            return;
        } catch (e: unknown) {
            // Handle unique constraint error (e.g., duplicate email)
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                res.status(409).json(fail("conflict", "Email already in use"));
                return;
            }
            throw e; // Let withJson handle unexpected errors (500)
        }
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end();
}

export default withJson(handler, ["GET", "POST"] as const);

// Allow larger request body size (useful for demo or bulk data)
export const config = { api: { bodyParser: { sizeLimit: "500kb" } } };
