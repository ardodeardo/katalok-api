import {
  pgTable,
  integer,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.domain";
import { platforms } from "./platform.domain";

export const contacts = pgTable(
  "contacts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: uuid().unique().notNull().defaultRandom(),
    userId: integer()
      .references(() => users.id)
      .notNull(),
    platformId: integer()
      .references(() => platforms.id)
      .notNull(),
    content: varchar({ length: 256 }).notNull().default(""), // string for number or link
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }),
    deletedAt: timestamp({ withTimezone: true }),
  },
  // (t) => [unique("contacts_user_platform_unique").on(t.userId, t.platformId)],
  (t) => [
    uniqueIndex("contacts_user_platform_unique")
      .on(t.userId, t.platformId)
      .where(sql`${t.deletedAt} is null`),
  ],
);
