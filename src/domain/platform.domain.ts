import {
  pgTable,
  pgEnum,
  integer,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const types = pgEnum("types", ["phone", "url"]);

export const platforms = pgTable("platforms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid().unique().notNull().defaultRandom(),
  name: varchar({ length: 128 }).notNull(),
  type: types().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
  deletedAt: timestamp({ withTimezone: true }),
});
