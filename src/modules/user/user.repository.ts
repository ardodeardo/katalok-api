import { isNull, and, eq, ne, or, sql, ilike, count } from "drizzle-orm";

import type {
  UserTablePayload,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateVisibilityPayload,
} from "./user.schema";

import { users } from "../../domain/user.domain";
import { db } from "../../infrastructure/postgres/client";
import { platforms } from "../../domain/platform.domain";

export const userRepository = {
  get: async () => {
    return await db.query.users.findMany({
      columns: { id: false },
      where: isNull(users.deletedAt),
      orderBy: (u, { desc }) => desc(u.id),
      with: {
        contacts: {
          columns: { uuid: true, content: true },
          with: {
            platform: { columns: { name: true, type: true, deletedAt: true } },
          },
          orderBy: (c, { asc }) => asc(c.id),
        },
      },
    });
  },

  select: async ({ q, page, perPage, sortBy, orderBy }: UserTablePayload) => {
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
      db.query.users.findMany({
        columns: { id: false },
        where: where,
        limit: perPage,
        offset: (page - 1) * perPage,
        orderBy: (u, { asc, desc }) => {
          const direction = orderBy === "asc" ? asc : desc;

          return [direction(u[sortBy]), desc(u.id)]; // matched sortBy will always desc by id (newest one)
        },
        with: {
          contacts: {
            columns: { uuid: true, content: true },
            with: {
              platform: {
                columns: { name: true, type: true, deletedAt: true },
              },
            },
            orderBy: (c, { asc }) => asc(c.id),
          },
        },
      }),

      db.select({ totalRow: count() }).from(users).where(where),
    ]);

    return { rows, totalRow };
  },

  selectByUuid: async (uuid: string) => {
    return await db.query.users.findFirst({
      columns: { id: false },
      where: and(eq(users.uuid, uuid), isNull(users.deletedAt)),
      with: {
        contacts: {
          columns: { uuid: true, content: true },
          with: {
            platform: { columns: { name: true, type: true, deletedAt: true } },
          },
          orderBy: (c, { asc }) => asc(c.id),
        },
      },
    });
  },

  selectExisted: async (
    email: string,
    username: string,
    excludeUuid?: string,
  ) => {
    return await db
      .select({
        id: users.id,
        email: users.email, // needed, dont remove
        username: users.username, // needed, dont remove
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

  create: async (data: CreateUserPayload) => {
    const uuid = Bun.randomUUIDv7();

    const [[created]] = await db.batch([
      db
        .insert(users)
        .values({ ...data, uuid })
        .returning({
          uuid: users.uuid,
          username: users.username,
          createdAt: users.createdAt,
        }),

      db.execute(sql`
        INSERT INTO contacts (user_id, platform_id)
        SELECT ${users.id}, ${platforms.id}
        FROM ${users}
        CROSS JOIN ${platforms}
        WHERE ${users.uuid} = ${uuid} AND ${platforms.deletedAt} IS NULL
      `),
    ]);

    return created;
  },

  update: async (uuid: string, data: UpdateUserPayload) => {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
      .returning({
        uuid: users.uuid,
        username: users.username,
        updatedAt: users.updatedAt,
      });

    return updated;
  },

  updateVisibility: async (uuid: string, data: UpdateVisibilityPayload) => {
    const [updated] = await db
      .update(users)
      .set({
        privateCatalog: data.privateCatalog,
        updatedAt: sql`NOW()`,
      })
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
      .returning({
        uuid: users.uuid,
        username: users.username,
        privateCatalog: users.privateCatalog,
        updatedAt: users.updatedAt,
      });

    return updated;
  },

  softDelete: async (uuid: string) => {
    const [deleted] = await db
      .update(users)
      .set({ deletedAt: sql`NOW()` })
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
      .returning({
        uuid: users.uuid,
        username: users.username,
        email: users.email,
        deletedAt: users.deletedAt,
      });

    return deleted;
  },
};
