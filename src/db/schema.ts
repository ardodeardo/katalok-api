import {
  pgTable,
  pgEnum,
  integer,
  uuid,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const roles = pgEnum("role", ["superadmin", "user"]);

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid().defaultRandom().notNull().unique(),
  firstName: varchar({ length: 128 }).notNull(),
  lastName: varchar({ length: 128 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 128 }).notNull().unique(),
  role: roles().default("user").notNull(),
  privateCatalog: boolean().default(false).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }),
  deletedAt: timestamp({ withTimezone: true }),
});
