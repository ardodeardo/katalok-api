import { Hono } from "hono";

import { zValidator } from "@hono/zod-validator";

import { userService } from "./user.service";
import {
  uuidParamSchema,
  createUserSchema,
  searchUserSchema,
} from "./user.schema";

const user = new Hono();

// QUERY /user
user.query("/", zValidator("json", searchUserSchema), async (c) => {
  const body = c.req.valid("json");

  const users = await userService.searchUsers(body);

  return c.json(users);
});

// GET /user
user.get("/", async (c) => {
  const activeUsers = await userService.getAllActiveUsers();

  return c.json({
    data: activeUsers,
  });
});

// GET /user/:uuid
user.get("/:uuid", zValidator("param", uuidParamSchema), async (c) => {
  const { uuid } = c.req.valid("param");

  const found = await userService.getActiveUserByUuid(uuid);

  if (!found) {
    return c.json({ message: "user not found" }, 404);
  }

  return c.json({ data: found });
});

// POST /user
user.post("/", zValidator("json", createUserSchema), async (c) => {
  const body = c.req.valid("json");

  const { conflicts, user: created } = await userService.createUser(body);

  // response to duplicate fields
  if (conflicts) {
    return c.json(
      {
        success: false,
        message: "duplicate fields value",
        error: {
          name: "customError",
          message: conflicts,
        },
      },
      409,
    ); // 409 - CONFLICT
  }

  return c.json({ data: created }, 201);
});

// PUT /user/:uuid
user.put(
  "/:uuid",
  zValidator("param", uuidParamSchema),
  zValidator("json", createUserSchema),
  async (c) => {
    const { uuid } = c.req.valid("param");
    const body = c.req.valid("json");

    const {
      notFound,
      conflicts,
      user: updated,
    } = await userService.updateUser(uuid, body);

    if (notFound) {
      return c.json({ message: "user not found" }, 404);
    }

    // response to duplicate fields
    if (conflicts) {
      return c.json(
        {
          success: false,
          message: "duplicate fields value",
          error: {
            name: "customError",
            message: conflicts,
          },
        },
        409,
      ); // 409 - CONFLICT
    }

    return c.json({ data: updated }, 200);
  },
);

// DELETE /:uuid
user.delete("/:uuid", zValidator("param", uuidParamSchema), async (c) => {
  const { uuid } = c.req.valid("param");

  const deleted = await userService.deleteUser(uuid);

  if (!deleted) {
    return c.json({ message: "user not found" }, 404);
  }

  return c.body(null, 204);
});

export default user;
