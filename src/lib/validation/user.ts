// src/lib/validation/user.ts
import { z } from "zod";

/**
 * Payload for POST /api/users
 * Only accepts fields the client is allowed to provide.
 * NOTE: ownerId must NOT be accepted from client. It is derived on the server.
 */
export const UserCreate = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
});
export type UserCreate = z.infer<typeof UserCreate>;

/**
 * Payload for PATCH /api/users/[id]
 * All fields are optional but at least one must be present.
 */
export const UserUpdate = z
    .object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });
export type UserUpdate = z.infer<typeof UserUpdate>;

/**
 * Dynamic route param for /api/users/[id]
 * Coerces "id" from string or string[] to a positive integer.
 */
export const IdParam = z.object({
    id: z.coerce.number().int().positive(),
});
