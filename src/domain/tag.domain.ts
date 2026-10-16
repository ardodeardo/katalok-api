import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./user.domain";

export const tags = pgTable(
  "tags",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer()
      .references(() => users.id)
      .notNull(),
    uuid: uuid().unique().notNull().defaultRandom(),
    slug: varchar({ length: 128 }).notNull(),
    name: varchar({ length: 128 }).notNull(),
    visible: boolean().default(true).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }),
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    uniqueIndex("tags_user_slug_unique")
      .on(t.userId, t.slug)
      .where(sql`${t.deletedAt} is null`),
  ],
);
