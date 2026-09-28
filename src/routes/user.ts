import { Hono } from "hono";

const user = new Hono();

type User = {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
};

const users: Array<User> = [
  {
    id: 1,
    uuid: "01a0e745-b8d3-71f9-bb4b-ab12d98f8742",
    firstName: "Auggie",
    lastName: "Salazaar",
    email: "auggie.salazaar@gmail.com",
  },
];

let nextId = 2;

// GET /user
user.get("/", (c) =>
  c.json({
    data: users,
  }),
);

// GET /user/:uuid
user.get("/:uuid", (c) => {
  const uuid = c.req.param("uuid");

  const found = users.find((user) => user.uuid === uuid);

  if (!found) {
    return c.json(
      {
        message: "user not found",
      },
      404,
    );
  }

  return c.json({
    data: found,
  });
});

// POST /user
user.post("/", async (c) => {
  const body = await c.req.json<Omit<User, "id" | "uuid">>();

  const added = users.push({
    id: nextId++,
    uuid: Bun.randomUUIDv7(),
    ...body,
  });

  return c.json(
    {
      data: added,
    },
    201,
  );
});

// user.post("/", (c) => c.text("POST /"));
// user.put("/", (c) => c.text("PUT /"));
// user.delete("/", (c) => c.text("DELETE /"));
// user.query("/", (c) => c.text("QUERY /"));

export default user;
