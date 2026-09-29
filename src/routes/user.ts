import { Hono } from "hono";

import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

const user = new Hono();

type User = {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

const users: Array<User> = [
  {
    id: 1,
    uuid: "01a0e745-b8d3-71f9-bb4b-ab12d98f8742",
    firstName: "Auggie",
    lastName: "Salazaar",
    email: "auggie.salazaar@gmail.com",
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
  },
];

let nextId: number = 2;

const existedUndeleted = (uuid: string) =>
  users.find((user) => user.uuid === uuid && user.deletedAt === null);

const emailTaken = (email: string, uuidException?: string) =>
  users.some(
    (user) =>
      user.email === email &&
      user.deletedAt === null &&
      user.uuid !== uuidException,
  );

// take out id and deletedAt
const publicResponse = (user: User) => ({
  uuid: user.uuid,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// GET /user
user.get("/", (c) => {
  const activeUsers = users.filter((user) => user.deletedAt === null);

  return c.json({
    data: activeUsers.map(publicResponse),
  });
});

// GET /user/:uuid
user.get("/:uuid", zValidator("param", z.object({ uuid: z.uuid() })), (c) => {
  const { uuid } = c.req.valid("param");

  // check if user existed and not deleted
  const found = existedUndeleted(uuid);
  if (!found) {
    return c.json(
      {
        message: "user not found",
      },
      404,
    );
  }

  return c.json({
    data: publicResponse(found),
  });
});

// POST /user
user.post(
  "/",
  zValidator(
    "json",
    z.object({
      firstName: z.string().min(2).max(128),
      lastName: z.string().max(128),
      email: z.email(),
    }),
  ),
  (c) => {
    const body = c.req.valid("json");

    // check if email is taken
    const taken = emailTaken(body.email);
    if (taken) {
      return c.json({ message: "email already used" }, 409); // 409 - CONFLICT
    }

    const newUser: User = {
      ...body, // safe by using zod. it will strip unlisted key from schema
      id: nextId++,
      uuid: Bun.randomUUIDv7(),
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };

    users.push(newUser);

    return c.json(
      {
        data: publicResponse(newUser),
      },
      201,
    );
  },
);

// PUT /user/:uuid (full payload)
user.put(
  "/:uuid",
  zValidator("param", z.object({ uuid: z.uuid() })),
  zValidator(
    "json",
    z.object({
      firstName: z.string().min(2).max(128),
      lastName: z.string().max(128),
      email: z.email(),
    }),
  ),
  (c) => {
    const { uuid } = c.req.valid("param");
    const body = c.req.valid("json");

    // check if user existed and not deleted
    const found = existedUndeleted(uuid);
    if (!found) {
      return c.json({ message: "user not found" }, 404);
    }

    // check if email is taken in, but exclude current uuid
    const taken = emailTaken(body.email, uuid);
    if (taken) {
      return c.json({ message: "email already used" }, 409); // 409 - CONFLICT
    }

    Object.assign(found, body);
    found.updatedAt = new Date();

    return c.json({ data: publicResponse(found) });
  },
);

// DELETE /:uuid
user.delete(
  "/:uuid",
  zValidator("param", z.object({ uuid: z.uuid() })),
  (c) => {
    const { uuid } = c.req.valid("param");

    // check if user existed and not deleted
    const found = existedUndeleted(uuid);
    if (!found) {
      return c.json({ message: "user not found" }, 404);
    }

    found.deletedAt = new Date();

    return c.body(null, 204);
  },
);

export default user;
