import { describe, expect, it } from "bun:test";
import app from ".";

describe("GET /health", () => {
  it("should return 200", async () => {
    const req = new Request("http://localhost/health");

    const res = await app.fetch(req);

    expect(res.status).toBe(200);
  });
});
