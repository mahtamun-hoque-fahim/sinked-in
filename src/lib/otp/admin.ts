import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminAllowlist } from "@/lib/db/schema";

// Admin auth is an allowlist check against the same phone+email+OTP
// pattern used for reports — never a separate auth system. See AGENTS.md
// Security Gotchas.
export async function isAllowlistedAdmin(phone: string, email: string): Promise<boolean> {
  const db = getDb();
  const [match] = await db
    .select()
    .from(adminAllowlist)
    .where(and(eq(adminAllowlist.phone, phone), eq(adminAllowlist.email, email)));
  return Boolean(match);
}
