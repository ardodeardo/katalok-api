import {
  pgTable,
  integer,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid().defaultRandom().notNull().unique(),
  firstName: varchar({ length: 128 }).notNull(),
  lastName: varchar({ length: 128 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }),
  deletedAt: timestamp({ withTimezone: true }),
});

// export type User = typeof users.$inferSelect;
// export type NewUser = typeof users.$inferInsert;
