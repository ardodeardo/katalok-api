import * as z from "zod";

export const uuidParamSchema = z.object({
  uuid: z.uuid(),
});

export const createUserSchema = z.object({
  firstName: z.string().min(2).max(64),
  lastName: z.string().max(64),
  username: z.string().min(8).max(64),
  email: z.email(),
});

export const searchUserSchema = z.object({
  q: z.string().trim().min(3).max(128).optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "firstName"]).default("createdAt"),
  orderBy: z.enum(["asc", "desc"]).default("desc"),
});

export type SearchUserInput = z.infer<typeof searchUserSchema>;
