import { getDb } from "@/lib/db";
import { reports, floodStatusEnum } from "@/lib/db/schema";
import { verifyToken } from "@/lib/otp/token";

const VALID_FLOOD_STATUSES = floodStatusEnum.enumValues;

// Public map data. Phone and email are never returned here — only
// responders inside /admin see contact info, and even then only after
// their own OTP verification. See BRAIN.md: zero-login map browsing.
export async function GET() {
  const db = getDb();
  const rows = await db
    .select({
      id: reports.id,
      latitude: reports.latitude,
      longitude: reports.longitude,
      address: reports.address,
      floodStatus: reports.floodStatus,
      aidStatus: reports.aidStatus,
      isProxy: reports.isProxy,
      photoUrl: reports.photoUrl,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    })
    .from(reports);

  return Response.json(rows);
}

function isValidPhone(phone: unknown): phone is string {
  return typeof phone === "string" && /^\+?[0-9]{7,15}$/.test(phone.trim());
}

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    phone,
    email,
    token,
    floodStatus,
    latitude,
    longitude,
    address,
    photoUrl,
    isProxy,
  } = body as Record<string, unknown>;

  if (!isValidPhone(phone)) {
    return Response.json({ error: "Invalid phone number" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  if (typeof token !== "string") {
    return Response.json({ error: "Missing verification token" }, { status: 401 });
  }
  const normalizedPhone = phone.trim();
  if (!verifyToken(token, normalizedPhone, "submit")) {
    return Response.json({ error: "Verification expired or invalid, please verify again" }, { status: 401 });
  }
  if (
    typeof floodStatus !== "string" ||
    !VALID_FLOOD_STATUSES.includes(floodStatus as (typeof VALID_FLOOD_STATUSES)[number])
  ) {
    return Response.json({ error: "Invalid flood status" }, { status: 400 });
  }
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return Response.json({ error: "Invalid location" }, { status: 400 });
  }

  const db = getDb();
  const [created] = await db
    .insert(reports)
    .values({
      phone: normalizedPhone,
      email: email.trim().toLowerCase(),
      floodStatus: floodStatus as (typeof VALID_FLOOD_STATUSES)[number],
      latitude: String(latitude),
      longitude: String(longitude),
      address: typeof address === "string" ? address : null,
      photoUrl: typeof photoUrl === "string" ? photoUrl : null,
      isProxy: Boolean(isProxy),
    })
    .returning();

  return Response.json(created, { status: 201 });
}
