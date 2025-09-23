import { z } from "zod";

// Create user
export const CreateUser = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name too long"),
    email: z.string().email("Invalid email format"),
});

// Update user (partial = all optional)
export const UpdateUser = CreateUser.partial();

// List query
export const ListQuery = z.object({
    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional(),
});
