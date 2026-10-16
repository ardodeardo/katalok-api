import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";

import { tags } from "./tag.domain";
import { products } from "./product.domain";

// -- junction table
// -- no need id, these two called as composite primary key
export const productTags = pgTable(
  "product_tags",
  {
    tagId: integer()
      .references(() => tags.id)
      .notNull(),
    productId: integer()
      .references(() => products.id)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.tagId] })],
);
