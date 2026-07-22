import { getDb } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { verifyToken } from "@/lib/otp/token";
import { isAllowlistedAdmin } from "@/lib/otp/admin";

// Full report detail including phone/email — only reachable after both
// allowlist match AND fresh OTP verification. See AGENTS.md Security
// Gotchas: do not build a second, separate admin auth system.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone");
  const email = url.searchParams.get("email");
  const token = url.searchParams.get("token");

  if (!phone || !email) {
    return Response.json({ error: "Missing phone or email" }, { status: 400 });
  }
  if (!token || !verifyToken(token, phone, "admin")) {
    return Response.json({ error: "Verification expired or invalid, please verify again" }, { status: 401 });
  }
  if (!(await isAllowlistedAdmin(phone, email.toLowerCase()))) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const db = getDb();
  const rows = await db.select().from(reports);

  return Response.json(rows);
}
