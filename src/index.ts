import { Hono } from "hono";
import user from "./routes/user";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/user", user);

export default app;
