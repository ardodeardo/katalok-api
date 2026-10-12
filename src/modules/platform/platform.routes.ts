import { Hono } from "hono";

import { platformService } from "./platform.service";

const platform = new Hono();

platform.get("/", async (c) => {
  const rows = await platformService.getAll();

  return c.json({ data: rows }, 200);
});

export default platform;
