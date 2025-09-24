// src/pages/api/users/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

    const { name, email } = req.body ?? {};
    const ownerId = Number(req.headers["x-user-id"]); // ← ヘッダから持ち主番号
    if (!name || !email) return res.status(400).json({ message: "Name and email are required" });
    if (!Number.isFinite(ownerId) || ownerId <= 0) return res.status(403).json({ message: "No ownerId" });

    try {
        const user = await prisma.user.create({
            data: { name, email, ownerId },   // ← 必須を渡す
            select: { id: true, name: true, email: true, ownerId: true },
        });
        return res.status(201).json({ ok: true, data: user });
    } catch (error) {
        console.error("CreateUser error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
