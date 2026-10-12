import { drizzle } from "drizzle-orm/neon-http";

import * as users from "../../domain/user.domain";
import * as platforms from "../../domain/platform.domain";
import * as contacts from "../../domain/contact.domain";
import * as relations from "../../domain/relations";

const schema = { ...users, ...platforms, ...contacts, ...relations };

export const db = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
  schema,
});
