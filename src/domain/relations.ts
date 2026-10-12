import { relations } from "drizzle-orm";

import { users } from "./user.domain";
import { contacts } from "./contact.domain";
import { platforms } from "./platform.domain";

export const usersRelations = relations(users, ({ many }) => ({
  contacts: many(contacts),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, { fields: [contacts.userId], references: [users.id] }),
  platform: one(platforms, { fields: [contacts.platformId], references: [platforms.id] }),
}));