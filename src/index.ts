import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";

import tag from "./modules/tag/tag.routes";
import user from "./modules/user/user.routes";
import contact from "./modules/contact/contact.routes";
import product from "./modules/product/product.routes";
import platform from "./modules/platform/platform.routes";

import { pgErrorStatus } from "./infrastructure/postgres/pg-error";

const app = new Hono().basePath("/v1");

app.use("*", cors());
app.use("*", logger());

app.get("/health", (c) => c.json({ status: "ok" }));

// -- modules

app.route("/tag", tag);
app.route("/user", user);
app.route("/contact", contact);
app.route("/product", product);
app.route("/platform", platform);

// -- error handler

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  console.error(error);

  // drizzle wrapped original error in .cause
  const err = ((error as any)?.cause ?? error) as {
    code?: string;
    constraint?: string;
    detail?: string;
    message?: string;
  };

  if (typeof err.code === "string" && /^[0-9A-Z]{5}$/.test(err.code)) {
    return c.json(
      {
        success: false,
        message: err.message,
        error: {
          name: "dbError",
          message: [
            {
              path: [[err.code, err.constraint].filter(Boolean).join(" -- ")],
              message:
                process.env.NODE_ENV === "production"
                  ? err.message
                  : err.detail,
            },
          ],
        },
      },
      pgErrorStatus(err.code),
    );
  }

  return c.json({ success: false, message: "internal server error" }, 500);
});

export default app;
