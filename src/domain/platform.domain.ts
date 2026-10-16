import {
  pgTable,
  pgEnum,
  uuid,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const platformTypeEnum = pgEnum("platform_type", ["phone", "url"]);

export const platforms = pgTable("platforms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid().unique().notNull().defaultRandom(),
  name: varchar({ length: 128 }).notNull(),
  type: platformTypeEnum().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
  deletedAt: timestamp({ withTimezone: true }),
});
