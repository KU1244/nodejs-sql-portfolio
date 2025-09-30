import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/result";
import { withJson } from "@/lib/http";
import { getAuthUserFromRequest } from "@/lib/auth";
import { IdParam, UserUpdate } from "@/lib/validation/user";
import { Prisma } from "@prisma/client";

/**
 * Utility: Check if the current user is either the record owner or an ADMIN.
 * If unauthorized, sends an HTTP response immediately.
 * Returns true if authorized, false otherwise.
 */
async function ensureOwnerOrAdmin(
    id: number,
    me: { id: number; role: string },
    res: NextApiResponse
): Promise<boolean> {
    const target = await prisma.user.findUnique({
        where: { id },
        select: { ownerId: true },
    });
    if (!target) {
        res.status(404).json(fail("not_found", "User not found"));
        return false;
    }
    const isOwner = me.id === target.ownerId;
    const isAdmin = String(me.role).toUpperCase() === "ADMIN";
    if (!isOwner && !isAdmin) {
        res.status(403).json(fail("forbidden", "Not allowed"));
        return false;
    }
    return true;
}

/**
 * API Handler for /api/users/[id]
 *
 * Supported methods:
 * - GET    → Fetch a single user by ID
 * - PATCH  → Update user data (allowed only for owner or admin)
 * - DELETE → Delete user (allowed only for owner or admin)
 */
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    // Simple demo auth (replace with JWT/session in production)
    const me = getAuthUserFromRequest(req);
    if (!me) {
        res.status(403).json(fail("forbidden", "No auth headers"));
        return;
    }

    // Validate "id" from query params
    const idParsed = IdParam.safeParse(req.query);
    if (!idParsed.success) {
        const details = idParsed.error.flatten((i) => i.message);
        res.status(400).json(fail("bad_request", "Invalid id", details));
        return;
    }
    const { id } = idParsed.data;

    if (req.method === "GET") {
        // Fetch user by ID (only whitelisted fields)
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, ownerId: true },
        });
        if (!user) {
            res.status(404).json(fail("not_found", "User not found"));
            return;
        }
        res.status(200).json(ok(user));
        return;
    }

    if (req.method === "PATCH") {
        // Validate request body for allowed fields
        const parsed = UserUpdate.safeParse(req.body as unknown);
        if (!parsed.success) {
            const details = parsed.error.flatten((i) => i.message);
            res.status(400).json(fail("bad_request", "Invalid body", details));
            return;
        }

        // Authorization check (owner or admin required)
        if (!(await ensureOwnerOrAdmin(id, me, res))) return;

        try {
            const updated = await prisma.user.update({
                where: { id },
                data: parsed.data,
                select: { id: true, name: true, email: true, ownerId: true },
            });
            res.status(200).json(ok(updated));
            return;
        } catch (e) {
            // Handle unique constraint error (duplicate email)
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                res.status(409).json(fail("conflict", "Email already used"));
                return;
            }
            throw e;
        }
    }

    if (req.method === "DELETE") {
        // Authorization check (owner or admin required)
        if (!(await ensureOwnerOrAdmin(id, me, res))) return;

        await prisma.user.delete({ where: { id } });
        res.status(204).end(); // No Content
        return;
    }

    // Fallback: Method not allowed
    res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
    res.status(405).end();
};

export default withJson(handler, ["GET", "PATCH", "DELETE"] as const);
