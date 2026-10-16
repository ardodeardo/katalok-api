import { Hono } from "hono";

import { zValidator } from "@hono/zod-validator";

import { productService } from "./product.service";

import {
  getProductsSchema,
  createProductSchema,
  updateProductSchema,
  updateVisibilitySchema,
} from "./product.schema";
import { uuidParamSchema } from "../common/common.schema";

const product = new Hono();

// GET /product
product.get("/", async (c) => {
  return c.json({ data: {} }, 200);
});

// GET /product/:uuid
product.get("/:uuid", zValidator("param", uuidParamSchema), async (c) => {
  return c.json({ data: {} }, 200);
});

// QUERY /product
product.query("/", zValidator("json", getProductsSchema), async (c) => {
  return c.json({ data: {} }, 200);
});

// POST /product
product.post("/", zValidator("json", createProductSchema), async (c) => {
  return c.json({ data: {} }, 201);
});

// PUT /product/:uuid
product.put(
  "/:uuid",
  zValidator("param", uuidParamSchema),
  zValidator("json", updateProductSchema),
  async (c) => {
    return c.json({ data: {} }, 200);
  },
);

// PATCH /product/:uuid/visibility
product.patch(
  "/:uuid/visibility",
  zValidator("param", uuidParamSchema),
  zValidator("json", updateVisibilitySchema),
  async (c) => {
    return c.json({ data: {} }, 200);
  },
);

// DELETE /product/:uuid
product.delete("/:uuid", zValidator("param", uuidParamSchema), async (c) => {
  return c.body(null, 204);
});

export default product;
