import { createHmac, timingSafeEqual } from "crypto";
import type { OtpPurpose } from "./index";

const TOKEN_TTL_MINUTES = 10;

// A verification token is short-lived proof that a phone number just
// passed OTP for a specific purpose. It is NOT a session — it expires
// quickly and is scoped to one purpose only. A "submit" token cannot be
// used to authorize an "update" or "admin" action. See AGENTS.md
// Conventions: OTP must be re-verified on every status change.
function sign(payload: string): string {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret) throw new Error("OTP_HASH_SECRET is not set");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function issueVerificationToken(phone: string, purpose: OtpPurpose): string {
  const expiresAt = Date.now() + TOKEN_TTL_MINUTES * 60_000;
  const payload = `${phone}|${purpose}|${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}|${signature}`).toString("base64url");
}

export function verifyToken(
  token: string,
  expectedPhone: string,
  expectedPurpose: OtpPurpose,
): boolean {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const parts = decoded.split("|");
  if (parts.length !== 4) return false;
  const [phone, purpose, expiresAtStr, signature] = parts;

  const payload = `${phone}|${purpose}|${expiresAtStr}`;
  const expectedSignature = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedSigBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedSigBuf.length) return false;
  if (!timingSafeEqual(sigBuf, expectedSigBuf)) return false;

  if (phone !== expectedPhone) return false;
  if (purpose !== expectedPurpose) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}
