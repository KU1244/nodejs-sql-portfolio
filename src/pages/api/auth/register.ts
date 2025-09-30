// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { withJson } from "@/lib/http";
import { fail, ok } from "@/lib/result"; // 既存CRUDと同じレスポンス形式を再利用

export default withJson(async (req: NextApiRequest, res: NextApiResponse) => {
    const { email, password, name } = req.body ?? {};

    // 1) Basic validation
    if (!email || typeof email !== "string") {
        return res.status(400).json(fail("bad_request", "email is required"));
    }
    if (!password || typeof password !== "string" || password.length < 8) {
        return res.status(400).json(fail("bad_request", "password must be at least 8 characters"));
    }

    // 2) Unique check
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json(fail("conflict", "email already exists"));
    }

    // 3) Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4) Save user
    const user = await prisma.user.create({
        data: { email, name: name ?? null, passwordHash },
        select: { id: true, email: true, name: true, createdAt: true },
    });

    return res.status(201).json(ok(user));
}, ["POST"]);
