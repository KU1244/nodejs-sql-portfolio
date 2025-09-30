// src/pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/result";
import { withJson } from "@/lib/http";
import { getAuthUserFromRequest } from "@/lib/auth";
import { IdParam, UserUpdate } from "@/lib/validation/user";
import { Prisma } from "@prisma/client";

// Helper: fetch target and check if the caller is owner or admin
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

// Explicit return type for withJson
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    // AuthN/Z: header-based demo. Replace with session/JWT in real apps.
    const me = getAuthUserFromRequest(req);
    if (!me) return void res.status(403).json(fail("forbidden", "No auth headers"));

    // Parse id safely
    const idParsed = IdParam.safeParse(req.query);
    if (!idParsed.success) {
        const details = idParsed.error.flatten((i) => i.message); // <- no-deprecated
        return void res.status(400).json(fail("bad_request", "Invalid id", details));
    }
    const { id } = idParsed.data;

    if (req.method === "GET") {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, ownerId: true },
        });
        if (!user) return void res.status(404).json(fail("not_found", "User not found"));
        return void res.status(200).json(ok(user));
    }

    if (req.method === "PATCH") {
        const parsed = UserUpdate.safeParse(req.body as unknown);
        if (!parsed.success) {
            const details = parsed.error.flatten((i) => i.message); // <- no-deprecated
            return void res.status(400).json(fail("bad_request", "Invalid body", details));
        }

        // Owner/Admin guard
        const g = await guardOwnerOrAdmin(id, me);
        if (g.kind === "not_found") return void res.status(404).json(fail("not_found", "User not found"));
        if (g.kind === "forbidden") return void res.status(403).json(fail("forbidden", "Not allowed"));

        try {
            const updated = await prisma.user.update({
                where: { id },
                data: parsed.data,
                select: { id: true, name: true, email: true, ownerId: true },
            });
            return void res.status(200).json(ok(updated));
        } catch (e) {
            // Map unique email violation -> 409 Conflict
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                return void res.status(409).json(fail("conflict", "Email already used"));
            }
            throw e;
        }
    }

    if (req.method === "DELETE") {
        // Owner/Admin guard
        const g = await guardOwnerOrAdmin(id, me);
        if (g.kind === "not_found") return void res.status(404).json(fail("not_found", "User not found"));
        if (g.kind === "forbidden") return void res.status(403).json(fail("forbidden", "Not allowed"));

        await prisma.user.delete({ where: { id } });
        return void res.status(204).end(); // No Content
    }

    res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
    return void res.status(405).end();
};

// NOTE: no generic args here (fix TS2558)
export default withJson(handler, ["GET", "PATCH", "DELETE"] as const);
