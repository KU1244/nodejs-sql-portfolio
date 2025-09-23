// src/pages/api/users/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        const user = await prisma.user.create({
            data: { name, email },
        });
        return res.status(200).json(user);
    } catch (error) {
        console.error("❌ CreateUser error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
