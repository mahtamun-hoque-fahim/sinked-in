import { createHash, randomInt } from "crypto";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { otpCodes } from "@/lib/db/schema";

export type OtpPurpose = "submit" | "update" | "admin";

const OTP_TTL_MINUTES = 10;
const OTP_LENGTH = 6;

// Per-phone rate limiting: this is a live emergency-relief matching
// system. Unthrottled OTP requests let someone spam false status flips
// (e.g. "aided" onto a real in-need report), which actively misdirects
// relief. See AGENTS.md Security Gotchas.
const MAX_REQUESTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

function hashCode(code: string, phone: string): string {
  const pepper = process.env.OTP_HASH_SECRET;
  if (!pepper) throw new Error("OTP_HASH_SECRET is not set");
  return createHash("sha256").update(`${phone}:${code}:${pepper}`).digest("hex");
}

function generateCode(): string {
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

export async function isRateLimited(phone: string): Promise<boolean> {
  const db = getDb();
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000);
  const recent = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), gt(otpCodes.createdAt, windowStart)));
  return recent.length >= MAX_REQUESTS_PER_WINDOW;
}

export async function createOtp(
  phone: string,
  email: string,
  purpose: OtpPurpose,
): Promise<{ code: string }> {
  const db = getDb();
  const code = generateCode();
  const codeHash = hashCode(code, phone);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await db.insert(otpCodes).values({
    phone,
    email,
    codeHash,
    purpose,
    expiresAt,
  });

  return { code };
}

// Verifies a code and, on success, marks it consumed so it cannot be
// replayed. Returns whether verification succeeded. Every status change
// (submit, update, admin) must call this fresh — a token is never reused
// across purposes or across actions. See AGENTS.md Conventions.
export async function verifyOtp(
  phone: string,
  code: string,
  purpose: OtpPurpose,
): Promise<boolean> {
  const db = getDb();
  const codeHash = hashCode(code, phone);
  const now = new Date();

  const [match] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.phone, phone),
        eq(otpCodes.codeHash, codeHash),
        eq(otpCodes.purpose, purpose),
        isNull(otpCodes.consumedAt),
        gt(otpCodes.expiresAt, now),
      ),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!match) return false;

  await db
    .update(otpCodes)
    .set({ consumedAt: now })
    .where(eq(otpCodes.id, match.id));

  return true;
}
