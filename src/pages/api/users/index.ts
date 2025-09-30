// src/pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/result";
import { withJson } from "@/lib/http";
import { getAuthUserFromRequest } from "@/lib/auth";
import { UserCreate } from "@/lib/validation/user";
import { Prisma } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    // AuthN/Z: simple header-based demo. Replace with session/JWT in real apps.
    const me = getAuthUserFromRequest(req);
    if (!me) return res.status(403).json(fail("forbidden", "No auth headers"));

    if (req.method === "GET") {
        // Paging: parse safely and cap to 100
        const raw = Number(req.query.limit ?? 20);
        const limit = Number.isFinite(raw) ? Math.min(raw, 100) : 20;

        // Whitelist fields to avoid leaking extra columns
        const users = await prisma.user.findMany({
            take: limit,
            orderBy: { id: "asc" },
            select: { id: true, name: true, email: true, ownerId: true },
            // If you want "only my records", enable:
            // where: { ownerId: me.id },
        });

        return res.status(200).json(ok(users));
    }

    if (req.method === "POST") {
        // Validate name/email only. Ignore any client-provided ownerId for security.
        const parsed = UserCreate.pick({ name: true, email: true }).safeParse(req.body as unknown);
        if (!parsed.success) {
            // Use flatten() instead of deprecated format()
            const details = parsed.error.flatten();
            return res.status(400).json(fail("bad_request", "Invalid body", details));
        }

        const { name, email } = parsed.data;

        try {
            // Security: derive ownerId from authenticated user, NOT from request body
            const created = await prisma.user.create({
                data: { name, email, ownerId: me.id },
                select: { id: true, name: true, email: true, ownerId: true },
            });

            res.setHeader("Location", `/api/users/${created.id}`);
            return res.status(201).json(ok(created));
        } catch (e) {
            // Handle unique constraint (duplicate email)
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                return res.status(409).json(fail("conflict", "Email already used"));
            }
            throw e;
        }
    }
}

export default withJson(handler, ["GET", "POST"] as const);

// Slightly raised body size limit for safety in demos
export const config = { api: { bodyParser: { sizeLimit: "500kb" } } };
