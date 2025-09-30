// src/pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/result";
import { withJson } from "@/lib/http";
import { getAuthUserFromRequest } from "@/lib/auth";
import { IdParam, UserUpdate } from "@/lib/validation/user";
import { Prisma } from "@prisma/client";

/**
 * Helper: check if the caller is the owner or an admin of the target record.
 */
async function guardOwnerOrAdmin(id: number, me: { id: number; role: string }) {
    const target = await prisma.user.findUnique({
        where: { id },
        select: { ownerId: true },
    });
    if (!target) return { kind: "not_found" as const };
    const isOwner = me.id === target.ownerId;
    const isAdmin = String(me.role).toUpperCase() === "ADMIN";
    if (!isOwner && !isAdmin) return { kind: "forbidden" as const };
    return { kind: "ok" as const };
}

/**
 * Handler for:
 * - GET    /api/users/[id] : read one
 * - PATCH  /api/users/[id] : update (owner/admin)
 * - DELETE /api/users/[id] : delete (owner/admin)
 */
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    // Simple demo auth via headers
    const me = getAuthUserFromRequest(req);
    if (!me) {
        res.status(403).json(fail("forbidden", "No auth headers"));
        return;
    }

    // Parse and validate id
    const idParsed = IdParam.safeParse(req.query);
    if (!idParsed.success) {
        const details = idParsed.error.flatten((i) => i.message);
        res.status(400).json(fail("bad_request", "Invalid id", details));
        return;
    }
    const { id } = idParsed.data;

    if (req.method === "GET") {
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
        const parsed = UserUpdate.safeParse(req.body as unknown);
        if (!parsed.success) {
            const details = parsed.error.flatten((i) => i.message);
            res.status(400).json(fail("bad_request", "Invalid body", details));
            return;
        }

        // Owner/Admin guard
        const g = await guardOwnerOrAdmin(id, me);
        if (g.kind === "not_found") {
            res.status(404).json(fail("not_found", "User not found"));
            return;
        }
        if (g.kind === "forbidden") {
            res.status(403).json(fail("forbidden", "Not allowed"));
            return;
        }

        try {
            const updated = await prisma.user.update({
                where: { id },
                data: parsed.data,
                select: { id: true, name: true, email: true, ownerId: true },
            });
            res.status(200).json(ok(updated));
            return;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                res.status(409).json(fail("conflict", "Email already used"));
                return;
            }
            throw e;
        }
    }

    if (req.method === "DELETE") {
        // Owner/Admin guard
        const g = await guardOwnerOrAdmin(id, me);
        if (g.kind === "not_found") {
            res.status(404).json(fail("not_found", "User not found"));
            return;
        }
        if (g.kind === "forbidden") {
            res.status(403).json(fail("forbidden", "Not allowed"));
            return;
        }

        await prisma.user.delete({ where: { id } });
        res.status(204).end(); // No Content
        return;
    }

    res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
    res.status(405).end();
};

// No generic args here (avoid TS2558)
export default withJson(handler, ["GET", "PATCH", "DELETE"] as const);
