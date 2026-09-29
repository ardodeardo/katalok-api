import { Hono } from "hono";

import { db } from "../db";
import { users } from "../db/schema";
import { isNull } from "drizzle-orm";

// import { zValidator } from "@hono/zod-validator";
// import * as z from "zod";

const user = new Hono();

// GET /user
user.get("/", async (c) => {
  const activeUsers = await db
    .select({
      uuid: users.uuid,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(isNull(users.deletedAt));

  return c.json({
    data: activeUsers,
  });
});

export default user;
