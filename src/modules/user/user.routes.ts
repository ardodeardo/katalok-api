import { Hono } from "hono";

import { zValidator } from "@hono/zod-validator";

import { userService } from "./user.service";

import {
  createUserSchema,
  getUsersSchema,
  updateUserSchema,
  updateVisibilitySchema,
} from "./user.schema";
import { uuidParamSchema } from "../common/common.schema";

const user = new Hono();

// GET /user
user.get("/", async (c) => {
  const users = await userService.getAll();

  return c.json({
    data: users,
  }, 200);
});

// QUERY /user
user.query("/", zValidator("json", getUsersSchema), async (c) => {
  const body = c.req.valid("json");

  const users = await userService.getUsers(body);

  return c.json(users, 200);
});

// GET /user/:uuid
user.get("/:uuid", zValidator("param", uuidParamSchema), async (c) => {
  const { uuid } = c.req.valid("param");

  const user = await userService.readUser(uuid);

  if (!user) {
    return c.json({ message: "user not found" }, 404);
  }

  return c.json({ data: user });
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
  zValidator("json", updateUserSchema),
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

    return c.json({ data: updated }, 200); // 200
  },
);

// PATCH /user/:uuid/visibility
user.patch(
  "/:uuid/visibility",
  zValidator("param", uuidParamSchema),
  zValidator("json", updateVisibilitySchema),
  async (c) => {
    const { uuid } = c.req.valid("param");
    const body = c.req.valid("json");

    const patched = await userService.updateCatalogVisibility(uuid, body);

    if (!patched) {
      return c.json({ message: "user not found" }, 404);
    }

    return c.json(
      {
        data: patched,
      },
      200,
    ); // 200
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
