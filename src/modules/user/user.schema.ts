import * as z from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2).max(64),
  lastName: z.string().max(64),
  username: z.string().min(8).max(64),
  email: z.email(),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.extend({
  contacts: z
    .array(
      z.object({
        uuid: z.uuid(),
        content: z.string().trim().max(128),
      }),
    )
    .max(2),
});

export type UpdateUserPayload = z.infer<typeof updateUserSchema>;

export const updateVisibilitySchema = z.object({
  privateCatalog: z.boolean(),
});

export type UpdateVisibilityPayload = z.infer<typeof updateVisibilitySchema>;

export const getUsersSchema = z.object({
  q: z.string().trim().min(3).max(128).optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "firstName"]).default("createdAt"),
  orderBy: z.enum(["asc", "desc"]).default("desc"),
});

export type UsersTablePayload = z.infer<typeof getUsersSchema>;
