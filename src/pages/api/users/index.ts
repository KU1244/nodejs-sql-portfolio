import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/result";
import { withJson } from "@/lib/http";
import { getAuthUserFromRequest } from "@/lib/auth";
import { UserCreate } from "@/lib/validation/user";
import { Prisma } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const me = getAuthUserFromRequest(req);
    if (!me) return res.status(403).json(fail("forbidden", "No auth headers"));

    if (req.method === "GET") {
        // paging & whitelist
        const limit = Math.min(Number(req.query.limit ?? 20), 100);
        const users = await prisma.user.findMany({
            take: limit,
            orderBy: { id: "asc" },
            select: { id: true, name: true, email: true, ownerId: true },
        });
        return res.status(200).json(ok(users));
    }

    if (req.method === "POST") {
        const parsed = UserCreate.safeParse(req.body as unknown);
        if (!parsed.success) return res.status(400).json(fail("bad_request", "Invalid body", parsed.error.format()));

        const data = parsed.data;
        // 権限：USER でも作成は可（ownerIdは自分想定でもOK）。必要なら制限。
        try {
            const created = await prisma.user.create({
                data,
                select: { id: true, name: true, email: true, ownerId: true },
            });
            res.setHeader("Location", `/api/users/${created.id}`);
            return res.status(201).json(ok(created));
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                return res.status(409).json(fail("conflict", "Email already used"));
            }
            throw e;
        }
    }
}
export default withJson(handler, ["GET", "POST"] as const);

export const config = { api: { bodyParser: { sizeLimit: "500kb" } } };
