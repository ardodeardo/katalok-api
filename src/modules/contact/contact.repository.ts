import { db } from "../../infrastructure/postgres/client";

import { contacts } from "../../domain/contact.domain";
import { isNull } from "drizzle-orm";

export const contactRepository = {
  get: async () => {
    return db.query.contacts.findMany({
      columns: { id: false },
      where: isNull(contacts.deletedAt),
      orderBy: (c, { desc }) => [desc(c.userId), desc(c.id)],
      with: {
        user: {
          columns: {
            firstName: true,
            lastName: true,
            username: true,
            deletedAt: true,
          },
        },
        platform: {
          columns: {
            name: true,
            deletedAt: true,
          },
        },
      },
    });
  },
};
