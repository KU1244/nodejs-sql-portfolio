// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { withJson } from "@/lib/http";
import { fail, ok } from "@/lib/result"; // unified response helpers

// Define request body type to avoid 'any'
type RegisterBody = {
    email?: string;
    password?: string;
    name?: string;
};

// Register endpoint for creating a new user with email/password
export default withJson(async (req: NextApiRequest, res: NextApiResponse) => {
    const { email, password, name } = (req.body ?? {}) as RegisterBody;

    // 1) Input validation
    if (typeof email !== "string" || email.length === 0) {
        return res.status(400).json(fail("bad_request", "email is required"));
    }

    if (typeof password !== "string" || password.length < 8) {
        return res
            .status(400)
            .json(fail("bad_request", "password must be at least 8 characters"));
    }

    // 2) Unique constraint check
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json(fail("conflict", "email already exists"));
    }

    // 3) Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // 4) Create user (ownerId is optional in schema)
    const user = await prisma.user.create({
        data: { email, name: name ?? undefined, passwordHash },
        select: { id: true, email: true, name: true, createdAt: true },
    });

    // 5) Return success with 201 Created
    return res.status(201).json(ok(user));
}, ["POST"]);
