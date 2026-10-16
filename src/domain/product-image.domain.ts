import {
  pgTable,
  text,
  uuid,
  index,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

import { products } from "./product.domain";

export const productImages = pgTable(
  "product_images",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: uuid().unique().notNull().defaultRandom(),
    productId: integer()
      .references(() => products.id)
      .notNull(),
    key: text().notNull(),
    alt: varchar({ length: 128 }).notNull().default(""),
    position: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }),
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [index("product_images_product_id_idx").on(t.productId)],
);
