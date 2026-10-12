import { db } from "../infrastructure/postgres/client";
import { users } from "../domain/user.domain";

const { NODE_ENV = "production" } = process.env;

export async function seedUsers() {
  const domain = {
    table: users,
    slug: "users",
  };

  // development only
  if (NODE_ENV === "development") {
    console.log(`clearing existing ${domain.slug}...`);
    await db.delete(domain.table);
  }

  const seedsData: (typeof domain.table.$inferInsert)[] = [
    {
      firstName: "superadmin",
      lastName: "",
      email: "simadanaga@gmail.com",
      username: "superadmin",
      role: "superadmin",
    },
    {
      firstName: "auggie",
      lastName: "salazaar",
      email: "auggie.salazaar@gmail.com",
      username: "auggiesalazaar",
    },
  ];

  console.log(`seeding ${domain.slug}...`);
  await db.insert(domain.table).values(seedsData).onConflictDoNothing();

  console.log(`seeding ${domain.slug} done!`);
}
