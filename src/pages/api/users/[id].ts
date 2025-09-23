// src/pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Users Detail Endpoint
 * - GET    /api/users/:id -> Get a user
 * - PUT    /api/users/:id -> Update a user (name/email)
 * - DELETE /api/users/:id -> Delete a user
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    // Validate id
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ ok: false, error: "Invalid 'id'." });
    }

    try {
        if (req.method === "GET") {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true },
            });
            if (!user) return res.status(404).json({ ok: false, error: "User not found." });
            return res.status(200).json({ ok: true, data: user });
        }

        if (req.method === "PUT") {
            const { name, email } = req.body ?? {};
            const data: { name?: string; email?: string } = {};

            if (typeof name === "string") {
                const v = name.trim();
                if (v.length === 0) return res.status(400).json({ ok: false, error: "Invalid 'name'." });
                data.name = v;
            }
            if (typeof email === "string") {
                const v = email.trim();
                if (v.length === 0) return res.status(400).json({ ok: false, error: "Invalid 'email'." });
                data.email = v;
            }
            if (!("name" in data) && !("email" in data)) {
                return res.status(400).json({ ok: false, error: "No fields to update." });
            }

            const updated = await prisma.user.update({
                where: { id: userId },
                data,
                select: { id: true, name: true, email: true },
            });
            return res.status(200).json({ ok: true, data: updated });
        }

        if (req.method === "DELETE") {
            await prisma.user.delete({ where: { id: userId } });
            return res.status(204).end(); // No content
        }

        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        // Normalize not-found for update/delete as 404
        if (message.toLowerCase().includes("record to delete does not exist") ||
            message.toLowerCase().includes("record to update not found")) {
            return res.status(404).json({ ok: false, error: "User not found." });
        }
        return res.status(500).json({ ok: false, error: message });
    }
}
