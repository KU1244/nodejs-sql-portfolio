import { z } from "zod";

export const UserCreate = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    ownerId: z.number().int().positive(),
});
export type UserCreate = z.infer<typeof UserCreate>;

export const UserUpdate = z
    .object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });
export type UserUpdate = z.infer<typeof UserUpdate>;

export const IdParam = z.object({ id: z.coerce.number().int().positive() });
