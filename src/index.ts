import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";

// group
import user from "./routes/user";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/user", user);

app.onError((error, c) => {
  if (error instanceof HTTPException) return error.getResponse();

  // drizzle wrapped original error in .cause
  const e = ((error as any)?.cause ?? error) as {
    code?: string;
    constraint?: string;
    detail?: string;
    message?: string;
  };

  if (typeof e.code === "string" && /^[0-9A-Z]{5}$/.test(e.code)) {
    return c.json(
      {
        success: false,
        message: e.message,
        error: {
          name: "dbError",
          message: [
            {
              path: [e.code, e.constraint].filter(Boolean).join(" -- "),
              message: e.detail ?? e.message,
            },
          ],
        },
      },
      500,
    );
  }

  console.error(error);
  return c.json({ success: false, message: "internal server error" }, 500);
});

export default app;
