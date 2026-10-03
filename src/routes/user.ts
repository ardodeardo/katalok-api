import { Hono, type Context } from "hono";

import { db } from "../db";
import { users } from "../db/schema";
import {
  isNull,
  eq,
  and,
  ne,
  sql,
  or,
  ilike,
  asc,
  desc,
  count,
} from "drizzle-orm";

import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

const user = new Hono();

const responseSchema = {
  uuid: users.uuid,
  firstName: users.firstName,
  lastName: users.lastName,
  username: users.username,
  role: users.role,
  email: users.email,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

const valueTaken = async (
  c: Context,
  body: {
    email: string;
    username: string;
  },
  exclude?: string, // exclusion uuid
) => {
  const existed = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
    })
    .from(users)
    .where(
      and(
        exclude ? ne(users.uuid, exclude) : undefined,
        or(eq(users.email, body.email), eq(users.username, body.username)),
        isNull(users.deletedAt),
      ),
    );

  const taken = (["email", "username"] as const).filter((field) =>
    existed.some((row) => row[field] === body[field]),
  );

  if (taken.length === 0) {
    return null;
  }

  return c.json(
    {
      success: false,
      message: "duplicate fields value",
      error: {
        name: "customError",
        message: taken.map((field) => {
          return {
            path: [field],
            message: `${field} already used`,
          };
        }),
      },
    },
    409,
  ); // 409 - CONFLICT
};

// QUERY /user
user.query(
  "/",
  zValidator(
    "json",
    z.object({
      q: z.string().trim().min(3).max(128).optional(),
      page: z.number().int().min(1).default(1),
      perPage: z.number().int().min(1).max(100).default(20),
      sortBy: z.enum(["createdAt"]).default("createdAt"),
      orderBy: z.enum(["asc", "desc"]).default("asc"),
    }),
  ),
  async (c) => {
    const { q, page, perPage, sortBy, orderBy } = c.req.valid("json");

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

    const [found, [{ total }]] = await Promise.all([
      db
        .select(responseSchema)
        .from(users)
        .where(where)
        .orderBy(direction(users[sortBy]), desc(users.id))
        .limit(perPage)
        .offset((page - 1) * perPage),
      db.select({ total: count() }).from(users).where(where),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return c.json({
      data: found,
      meta: {
        q,
        page,
        perPage,
        sortBy,
        orderBy,
        total,
        totalPages,
      },
    });
  },
);

// GET /user
user.get("/", async (c) => {
  const activeUsers = await db
    .select(responseSchema)
    .from(users)
    .where(isNull(users.deletedAt));

  return c.json({
    data: activeUsers,
  });
});

// GET /user/:uuid
user.get(
  "/:uuid",
  zValidator(
    "param",
    z.object({
      uuid: z.uuid(),
    }),
  ),
  async (c) => {
    const { uuid } = c.req.valid("param");

    const [found] = await db
      .select(responseSchema)
      .from(users)
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)));

    if (!found) {
      return c.json({ message: "user not found" }, 404);
    }

    return c.json({ data: found });
  },
);

// POST /user
user.post(
  "/",
  zValidator(
    "json",
    z.object({
      firstName: z.string().min(2).max(64),
      lastName: z.string().max(64),
      username: z.string().min(8).max(64),
      email: z.email(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");

    // handle duplicate fields
    const taken = await valueTaken(c, body);

    if (taken) {
      return taken;
    }

    const [created] = await db
      .insert(users)
      .values(body)
      .returning(responseSchema);

    return c.json({ data: created }, 201);
  },
);

// PUT /user/:uuid
user.put(
  "/:uuid",
  zValidator(
    "param",
    z.object({
      uuid: z.uuid(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      firstName: z.string().min(2).max(64),
      lastName: z.string().max(64),
      username: z.string().min(8).max(64),
      email: z.email(),
    }),
  ),
  async (c) => {
    const { uuid } = c.req.valid("param");
    const body = c.req.valid("json");

    // check if the user existed at first
    const [existed] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)));

    if (!existed) {
      return c.json({ message: "user not found" }, 404);
    }

    // handle duplicate fields
    const taken = await valueTaken(c, body, uuid);

    if (taken) {
      return taken;
    }

    const [updated] = await db
      .update(users)
      .set({ ...body, updatedAt: sql`NOW()` })
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
      .returning(responseSchema);

    return c.json({ data: updated }); // 200
  },
);

// DELETE /:uuid
user.delete(
  "/:uuid",
  zValidator(
    "param",
    z.object({
      uuid: z.uuid(),
    }),
  ),
  async (c) => {
    const { uuid } = c.req.valid("param");

    // check if the user existed and still active
    const [existed] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)));

    if (!existed) {
      return c.json({ message: "user not found" }, 404);
    }

    await db
      .update(users)
      .set({ deletedAt: sql`NOW()` })
      .where(eq(users.uuid, uuid))
      .returning({ id: users.id });

    return c.body(null, 204);
  },
);

export default user;
