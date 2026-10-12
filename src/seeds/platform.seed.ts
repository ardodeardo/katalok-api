import { db } from "../infrastructure/postgres/client";
import { platforms } from "../domain/platform.domain";

const { NODE_ENV = "production" } = process.env;

export async function seedPlatforms() {
  const domain = {
    table: platforms,
    slug: "platforms",
  };

  // development only
  if (NODE_ENV === "development") {
    console.log(`clearing existing ${domain.slug}...`);
    await db.delete(domain.table);
  }

  const seedsData: (typeof domain.table.$inferInsert)[] = [
    {
      type: "phone",
      name: "Whatsapp",
    },
  ];

  console.log(`seeding ${domain.slug}...`);
  await db.insert(domain.table).values(seedsData).onConflictDoNothing();

  console.log(`seeding ${domain.slug} done!`);
}
