// Seeds admin_allowlist from ADMIN_ALLOWLIST_SEED (comma-separated
// phone:email pairs). Safe to re-run — skips pairs already present.
// Usage: npx tsx scripts/seed-admin-allowlist.ts

import { getDb } from "../src/lib/db";
import { adminAllowlist } from "../src/lib/db/schema";
import { and, eq } from "drizzle-orm";

async function main() {
  const raw = process.env.ADMIN_ALLOWLIST_SEED;
  if (!raw || !raw.trim()) {
    console.log("ADMIN_ALLOWLIST_SEED is not set — nothing to seed.");
    return;
  }

  const pairs = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const db = getDb();
  let created = 0;
  let skipped = 0;

  for (const pair of pairs) {
    const [phone, email] = pair.split(":").map((v) => v?.trim());
    if (!phone || !email) {
      console.warn(`Skipping malformed entry: "${pair}" (expected phone:email)`);
      continue;
    }

    const normalizedEmail = email.toLowerCase();
    const [existing] = await db
      .select()
      .from(adminAllowlist)
      .where(and(eq(adminAllowlist.phone, phone), eq(adminAllowlist.email, normalizedEmail)));

    if (existing) {
      skipped += 1;
      continue;
    }

    await db.insert(adminAllowlist).values({ phone, email: normalizedEmail });
    created += 1;
  }

  console.log(`Admin allowlist seed complete: ${created} created, ${skipped} already present.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
