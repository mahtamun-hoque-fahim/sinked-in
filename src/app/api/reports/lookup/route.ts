import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { verifyToken } from "@/lib/otp/token";

// Reports are matched by phone number, not by ID — this is the phone-lookup
// route that replaced the old /report/[id]/update design. See SITETREE.md
// and PLANNER.md Notes & decisions (2026-07-21).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone");
  const token = url.searchParams.get("token");

  if (!phone) {
    return Response.json({ error: "Missing phone" }, { status: 400 });
  }
  if (!token || !verifyToken(token, phone, "update")) {
    return Response.json({ error: "Verification expired or invalid, please verify again" }, { status: 401 });
  }

  const db = getDb();
  const rows = await db.select().from(reports).where(eq(reports.phone, phone));

  return Response.json(rows);
}
