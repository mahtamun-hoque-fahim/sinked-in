import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { reports, floodStatusEnum, aidStatusEnum } from "@/lib/db/schema";
import { verifyToken } from "@/lib/otp/token";

const VALID_FLOOD_STATUSES = floodStatusEnum.enumValues;
const VALID_AID_STATUSES = aidStatusEnum.enumValues;

// Next.js 16: params is a Promise, must be awaited. See next16builder skill.
export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/reports/[id]">,
) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { phone, token, floodStatus, aidStatus } = body as Record<string, unknown>;

  if (typeof phone !== "string" || !phone.trim()) {
    return Response.json({ error: "Invalid phone number" }, { status: 400 });
  }
  if (typeof token !== "string" || !verifyToken(token, phone.trim(), "update")) {
    return Response.json({ error: "Verification expired or invalid, please verify again" }, { status: 401 });
  }

  const db = getDb();
  const [existing] = await db.select().from(reports).where(eq(reports.id, id));
  if (!existing) {
    return Response.json({ error: "Report not found" }, { status: 404 });
  }
  // A report can only be updated by the phone number it was filed under.
  if (existing.phone !== phone.trim()) {
    return Response.json({ error: "This report does not belong to that phone number" }, { status: 403 });
  }

  const updates: Partial<typeof reports.$inferInsert> = { updatedAt: new Date() };

  if (floodStatus !== undefined) {
    if (
      typeof floodStatus !== "string" ||
      !VALID_FLOOD_STATUSES.includes(floodStatus as (typeof VALID_FLOOD_STATUSES)[number])
    ) {
      return Response.json({ error: "Invalid flood status" }, { status: 400 });
    }
    updates.floodStatus = floodStatus as (typeof VALID_FLOOD_STATUSES)[number];
  }

  if (aidStatus !== undefined) {
    if (
      typeof aidStatus !== "string" ||
      !VALID_AID_STATUSES.includes(aidStatus as (typeof VALID_AID_STATUSES)[number])
    ) {
      return Response.json({ error: "Invalid aid status" }, { status: 400 });
    }
    updates.aidStatus = aidStatus as (typeof VALID_AID_STATUSES)[number];
  }

  const [updated] = await db
    .update(reports)
    .set(updates)
    .where(eq(reports.id, id))
    .returning();

  return Response.json(updated);
}
