import { Hono } from "hono";

import { zValidator } from "@hono/zod-validator";

import { tagService } from "./tag.service";

import {
  getTagsSchema,
  createTagSchema,
  updateTagSchema,
  updateVisibilitySchema,
} from "./tag.schema";
import { uuidParamSchema } from "../common/common.schema";

const tag = new Hono();

// GET /tag
tag.get("/", async (c) => {
  return c.json({ data: {} }, 200);
});

// GET /tag/:uuid
tag.get("/:uuid", zValidator("param", uuidParamSchema), async (c) => {
  return c.json({ data: {} }, 200);
});

// QUERY /tag
tag.query("/", zValidator("json", getTagsSchema), async (c) => {
  return c.json({ data: {} }, 200);
});

// POST /tag
tag.post("/", zValidator("json", createTagSchema), async (c) => {
  return c.json({ data: {} }, 201);
});

// PUT /tag/:uuid
tag.put(
  "/:uuid",
  zValidator("param", uuidParamSchema),
  zValidator("json", updateTagSchema),
  async (c) => {
    return c.json({ data: {} }, 200);
  },
);

// PATCH /tag/:uuid/visibility
tag.patch(
  "/:uuid/visibility",
  zValidator("param", uuidParamSchema),
  zValidator("json", updateVisibilitySchema),
  async (c) => {
    return c.json({ data: {} }, 200);
  },
);

// DELETE /tag/:uuid
tag.delete("/:uuid", zValidator("param", uuidParamSchema), async (c) => {
  return c.body(null, 204);
});

export default tag;
