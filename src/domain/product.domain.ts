import {
  pgTable,
  pgEnum,
  uuid,
  check,
  integer,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./user.domain";
import { contacts } from "./contact.domain";

export const currencyEnum = pgEnum("currency", ["idr", "usd"]);
export const productConditionEnum = pgEnum("product_condition", [
  "new",
  "used",
]);

export const products = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: uuid().unique().notNull().defaultRandom(),
    userId: integer()
      .references(() => users.id)
      .notNull(),
    contactId: integer()
      .references(() => contacts.id)
      .notNull(),
    slug: varchar({ length: 128 }).notNull(),
    name: varchar({ length: 128 }).notNull(),
    description: varchar({ length: 1024 }).notNull().default(""),
    quantity: integer().notNull().default(1),
    condition: productConditionEnum().notNull().default("new"),
    currency: currencyEnum().notNull().default("idr"),
    price: integer().notNull(),
    visible: boolean().default(true).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }),
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    uniqueIndex("products_user_slug_unique")
      .on(t.userId, t.slug)
      .where(sql`${t.deletedAt} is null`),
    check("products_price_check", sql`${t.price} >= 0`),
    check("products_quantity_check", sql`${t.quantity} >= 0`),
  ],
);
