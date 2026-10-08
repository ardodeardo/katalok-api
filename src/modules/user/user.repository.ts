import { db } from "../../db";
import { users } from "../../db/schema";
import {
  isNull,
  and,
  eq,
  ne,
  or,
  sql,
  ilike,
  asc,
  desc,
  count,
} from "drizzle-orm";
import type { SearchUserInput } from "./user.schema";

export const responseSchema = {
  uuid: users.uuid,
  firstName: users.firstName,
  lastName: users.lastName,
  username: users.username,
  role: users.role,
  email: users.email,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export const userRepository = {
  findAllActive: async () => {
    return await db
      .select(responseSchema)
      .from(users)
      .where(isNull(users.deletedAt));
  },

  findActiveByUuid: async (uuid: string) => {
    const [found] = await db
      .select(responseSchema)
      .from(users)
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)));

    return found;
  },

  findDuplicates: async (
    email: string,
    username: string,
    excludeUuid?: string,
  ) => {
    return await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(
        and(
          excludeUuid ? ne(users.uuid, excludeUuid) : undefined,
          or(eq(users.email, email), eq(users.username, username)),
          isNull(users.deletedAt),
        ),
      );
  },

  search: async ({ q, page, perPage, sortBy, orderBy }: SearchUserInput) => {
    const direction = orderBy === "asc" ? asc : desc;

    const where = and(
      isNull(users.deletedAt),
      q
        ? or(
            ilike(users.firstName, `%${q}%`),
            ilike(users.lastName, `%${q}%`),
            ilike(users.email, `%${q}%`),
            ilike(users.username, `%${q}%`),
          )
        : undefined,
    );

    const [rows, [{ totalRow }]] = await Promise.all([
      db
        .select(responseSchema)
        .from(users)
        .where(where)
        .orderBy(direction(users[sortBy]), desc(users.id)) // matched sortBy will always desc by id (newest one)
        .limit(perPage)
        .offset((page - 1) * perPage),
      db.select({ totalRow: count() }).from(users).where(where),
    ]);

    return { rows, totalRow };
  },

  create: async (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  }) => {
    const [created] = await db
      .insert(users)
      .values(data)
      .returning(responseSchema);

    return created;
  },

  update: async (
    uuid: string,
    data: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
    },
  ) => {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
      .returning(responseSchema);

    return updated;
  },

  softDelete: async (uuid: string) => {
    await db
      .update(users)
      .set({ deletedAt: sql`NOW()` })
      .where(eq(users.uuid, uuid));
  },
};
