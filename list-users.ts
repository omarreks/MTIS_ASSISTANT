import "dotenv/config";
import { getDb } from "./server/db";
import { users, userProfiles } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function listUsers() {
  const db = await getDb();
  if (!db) {
    console.error("Could not connect to database");
    return;
  }

  const result = await db
    .select({
      email: users.email,
      name: users.name,
      nationalId: userProfiles.nationalId
    })
    .from(users)
    .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
    .limit(10);

  console.log("\n--- Sample Student Credentials (from 1,000 imports) ---");
  console.table(result);
}

listUsers().then(() => process.exit(0));
