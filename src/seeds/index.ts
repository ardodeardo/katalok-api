// src/seeds/index.ts
import { sql } from "drizzle-orm";
import { db } from "../infrastructure/postgres/client";
import { users } from "../domain/user.domain";
import { platforms } from "../domain/platform.domain";
import { contacts } from "../domain/contact.domain";

const { NODE_ENV = "production" } = process.env;

async function main() {
  // 1. clear (development only), child dulu
  if (NODE_ENV === "development") {
    console.log("clearing contacts, users, platforms...");
    await db.delete(contacts);
    await db.delete(users);
    await db.delete(platforms);
  }

  // 2. platforms
  console.log("seeding platforms...");
  await db
    .insert(platforms)
    .values([{ name: "Whatsapp", type: "phone" }])
    .onConflictDoNothing();

  // 3. users (hanya yang baru ke-insert yang di-return)
  console.log("seeding users...");
  const inserted = await db
    .insert(users)
    .values([
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
    ])
    .onConflictDoNothing()
    .returning({ id: users.id });

  // 4. contacts: user baru x platform aktif
  if (inserted.length) {
    console.log("seeding contacts...");
    const ids = inserted.map((u) => u.id);

    await db.execute(sql`
      INSERT INTO contacts (user_id, platform_id)
      SELECT ${users.id}, ${platforms.id}
      FROM ${users}
      CROSS JOIN ${platforms}
      WHERE ${users.id} IN (${sql.join(ids, sql`, `)})
        AND ${platforms.deletedAt} IS NULL
    `);
  }

  console.log("seeding all done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("seeding failed:", error);
    process.exit(1);
  });