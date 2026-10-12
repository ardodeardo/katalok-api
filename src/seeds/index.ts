import { seedUsers } from "./user.seed";
import { seedPlatforms } from "./platform.seed";

// const { NODE_ENV = "production" } = process.env;

async function main() {
  //   if (NODE_ENV === "production") {
  //     throw new Error("seeders is disabled in production");
  //   }

  await seedUsers();
  await seedPlatforms();
  // await seedTags();

  console.log("seeding all seeders done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("seeding failed:", error);

    process.exit(1);
  });
