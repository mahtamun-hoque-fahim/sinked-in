import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { reports, aidStatusEnum } from "@/lib/db/schema";
import { verifyToken } from "@/lib/otp/token";
import { isAllowlistedAdmin } from "@/lib/otp/admin";

const VALID_AID_STATUSES = aidStatusEnum.enumValues;

// Next.js 16: params is a Promise, must be awaited. See next16builder skill.
export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/admin/reports/[id]">,
) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { phone, email, token, aidStatus } = body as Record<string, unknown>;

  if (typeof phone !== "string" || typeof email !== "string") {
    return Response.json({ error: "Missing phone or email" }, { status: 400 });
  }
  if (typeof token !== "string" || !verifyToken(token, phone, "admin")) {
    return Response.json({ error: "Verification expired or invalid, please verify again" }, { status: 401 });
  }
  if (!(await isAllowlistedAdmin(phone, email.toLowerCase()))) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }
  if (
    typeof aidStatus !== "string" ||
    !VALID_AID_STATUSES.includes(aidStatus as (typeof VALID_AID_STATUSES)[number])
  ) {
    return Response.json({ error: "Invalid aid status" }, { status: 400 });
  }

  const db = getDb();
  const [updated] = await db
    .update(reports)
    .set({ aidStatus: aidStatus as (typeof VALID_AID_STATUSES)[number], updatedAt: new Date() })
    .where(eq(reports.id, id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Report not found" }, { status: 404 });
  }

  return Response.json(updated);
}
