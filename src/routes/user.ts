import { Hono } from "hono";

import { db } from "../db";
import { users } from "../db/schema";
import { isNull, eq, and, ne, sql } from "drizzle-orm";

import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

const user = new Hono();

const responseSchema = {
  uuid: users.uuid,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

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
      email: z.email(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");

    // check taken email
    const [taken] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(and(eq(users.email, body.email), isNull(users.deletedAt)));

    if (taken) {
      return c.json({ message: "email already used" }, 409); // 409 - CONFLICT
    }

    // -- gap time, might happened race condition

    const [created] = await db
      .insert(users)
      .values(body)
      .returning(responseSchema);

    return c.json({ data: created }, 201);
  },
);ƒ

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

    // check taken email, expect current uuid
    const [taken] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(
        and(
          ne(users.uuid, uuid),
          eq(users.email, body.email),
          isNull(users.deletedAt),
        ),
      );

    if (taken) {
      return c.json({ message: "email already used" }, 409); // 409 - CONFLICT
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
