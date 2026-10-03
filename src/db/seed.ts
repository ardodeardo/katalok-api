import { db } from "../db";
import { users } from "../db/schema";

async function seed() {
  // development only
  console.log("clearing existing users...");
  await db.delete(users);

  const _users: (typeof users.$inferInsert)[] = [
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

  console.log("seeding users...");
  await db.insert(users).values(_users).onConflictDoNothing();

  console.log("seeding users done!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("seeding users failed:", error);

  process.exit(1);
});
