import { describe, expect, it } from "bun:test";
import app from "../index";

describe("GET /user", () => {
  it("should return 200 and a list of users", async () => {
    const req = new Request("http://localhost/user");

    const res = await app.fetch(req);

    expect(res.status).toBe(200);

    const body = await res.json();

    // cek envelope shape
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);

    // check at least 1 user exists (from seed data)
    expect(body.data.length).toBeGreaterThan(0);

    // check publicResponse fields - id & deletedAt must NOT leak
    const firstUser = body.data[0];
    expect(firstUser).toHaveProperty("uuid");
    expect(firstUser).toHaveProperty("firstName");
    expect(firstUser).toHaveProperty("email");
    expect(firstUser).not.toHaveProperty("id");
    expect(firstUser).not.toHaveProperty("deletedAt");
  });
});
