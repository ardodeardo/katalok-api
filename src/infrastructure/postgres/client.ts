import { drizzle } from "drizzle-orm/neon-http";

import * as tags from "../../domain/tag.domain";
import * as users from "../../domain/user.domain";
import * as relations from "../../domain/relations";
import * as contacts from "../../domain/contact.domain";
import * as products from "../../domain/product.domain";
import * as platforms from "../../domain/platform.domain";
import * as productTags from "../../domain/product-tag.domain";
import * as productImages from "../../domain/product-image.domain";

const schema = {
  ...tags,
  ...users,
  ...contacts,
  ...products,
  ...platforms,
  ...productTags,
  ...productImages,
  ...relations,
};

export const db = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
  schema,
});
