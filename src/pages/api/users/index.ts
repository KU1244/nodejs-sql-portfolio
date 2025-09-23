// src/pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Users Collection Endpoint
 * - GET  /api/users     -> List users
 * - POST /api/users     -> Create a new user
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "GET") {
            // List users (basic fields only for demo)
            const users = await prisma.user.findMany({
                orderBy: { id: "asc" },
                select: { id: true, name: true, email: true },
            });
            return res.status(200).json({ ok: true, data: users });
        }

        if (req.method === "POST") {
            // Basic input validation (no zod to keep dependencies minimal)
            const { name, email } = req.body ?? {};
            if (typeof name !== "string" || name.trim().length === 0) {
                return res.status(400).json({ ok: false, error: "Invalid 'name'." });
            }
            if (typeof email !== "string" || email.trim().length === 0) {
                return res.status(400).json({ ok: false, error: "Invalid 'email'." });
            }

            // Create user
            const user = await prisma.user.create({
                data: { name: name.trim(), email: email.trim() },
                select: { id: true, name: true, email: true },
            });

            return res.status(201).json({ ok: true, data: user });
        }

        // Method not allowed
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    } catch (err: unknown) {
        // Safe error exposure for portfolio
        const message = err instanceof Error ? err.message : "Unexpected error";
        return res.status(500).json({ ok: false, error: message });
    }
}
