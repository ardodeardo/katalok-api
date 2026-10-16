import { relations } from "drizzle-orm";

import { tags } from "./tag.domain";
import { users } from "./user.domain";
import { products } from "./product.domain";
import { contacts } from "./contact.domain";
import { platforms } from "./platform.domain";
import { productTags } from "./product-tag.domain";
import { productImages } from "./product-image.domain";

//                     users
//           ┌───────────┼───────────┐
//        1:many      1:many      1:many
//           │           │           │
//        contacts ◄─ products      tags
//           │ many:1 │      │       │
//           │ (contactId)   │       │
//        many:1   1:many  1:many  1:many
//           │        │      │       │
//       platforms    │      └─► product_tags ◄─┘
//                    │         (productId, tagId)
//                    ▼
//              product_images
//                (position)

//    products ◄──── many:many ────► tags
//           (through product_tags)

// How to read it:
// - A user has many contacts, products and tags.
// - A contact belongs to one platform.
// - A product uses one of its owner's contacts (contactId) for the contact button.
// - A product has many images, ordered by position.
// - A product has many tags and a tag has many products. product_tags is the bridge between them.

export const usersRelations = relations(users, ({ many }) => ({
  contacts: many(contacts),
  tags: many(tags),
  products: many(products),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, { fields: [contacts.userId], references: [users.id] }),
  platform: one(platforms, {
    fields: [contacts.platformId],
    references: [platforms.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, { fields: [products.userId], references: [users.id] }),
  contact: one(contacts, {
    fields: [products.contactId],
    references: [contacts.id],
  }),
  productTags: many(productTags),
  productImages: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  productTags: many(productTags),
}));

// -- junction: product <-> tag (many-to-many lewat productTags)
export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}));
