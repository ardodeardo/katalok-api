import { Hono } from "hono";

import { contactService } from "./contact.service";

const contact = new Hono();

contact.get("/", async (c) => {
  const rows = await contactService.getAll(); // later refactor to get based on token for product page

  return c.json({ data: rows }, 200);
});

export default contact;
