import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/result";
import { withJson } from "@/lib/http";
import { getAuthUserFromRequest } from "@/lib/auth";
import { IdParam, UserUpdate } from "@/lib/validation/user";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const me = getAuthUserFromRequest(req);
    if (!me) return res.status(403).json(fail("forbidden", "No auth headers"));

    const { id } = IdParam.parse(req.query);

    if (req.method === "GET") {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, ownerId: true },
        });
        if (!user) return res.status(404).json(fail("not_found", "User not found"));
        return res.status(200).json(ok(user));
    }

    if (req.method === "PATCH") {
        const body = UserUpdate.safeParse(req.body as unknown);
        if (!body.success) return res.status(400).json(fail("bad_request", "Invalid body", body.error.format()));

        // RBAC: ADMIN or 自分のリソースのみ
        const target = await prisma.user.findUnique({ where: { id }, select: { ownerId: true } });
        if (!target) return res.status(404).json(fail("not_found", "User not found"));
        if (me.role !== "ADMIN" && me.id !== target.ownerId) {
            return res.status(403).json(fail("forbidden", "Not allowed"));
        }
        const updated = await prisma.user.update({
            where: { id },
            data: body.data,
            select: { id: true, name: true, email: true, ownerId: true },
        });
        return res.status(200).json(ok(updated));
    }

    if (req.method === "DELETE") {
        const target = await prisma.user.findUnique({ where: { id }, select: { ownerId: true } });
        if (!target) return res.status(404).json(fail("not_found", "User not found"));
        if (me.role !== "ADMIN" && me.id !== target.ownerId) {
            return res.status(403).json(fail("forbidden", "Not allowed"));
        }
        await prisma.user.delete({ where: { id } });
        return res.status(200).json(ok({ id }));
    }
}
export default withJson(handler, ["GET", "PATCH", "DELETE"] as const);

export const config = { api: { bodyParser: { sizeLimit: "500kb" } } };
