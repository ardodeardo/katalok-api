import { db } from "../../infrastructure/postgres/client";
import { platforms } from "../../domain/platform.domain";
import { isNull } from "drizzle-orm";

export const platformRepository = {
  get: async () => {
    return db
      .select({
        uuid: platforms.uuid,
        name: platforms.name,
        type: platforms.type,
      })
      .from(platforms)
      .where(isNull(platforms.deletedAt));
  },
};
