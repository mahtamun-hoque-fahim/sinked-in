import { createOtp, isRateLimited, type OtpPurpose } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/otp/email";

const VALID_PURPOSES: OtpPurpose[] = ["submit", "update", "admin"];

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

  const { phone, email, purpose } = body as Record<string, unknown>;

  if (!isValidPhone(phone)) {
    return Response.json({ error: "Invalid phone number" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  if (typeof purpose !== "string" || !VALID_PURPOSES.includes(purpose as OtpPurpose)) {
    return Response.json({ error: "Invalid purpose" }, { status: 400 });
  }

  const normalizedPhone = phone.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (await isRateLimited(normalizedPhone)) {
    return Response.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 },
    );
  }

  const { code } = await createOtp(normalizedPhone, normalizedEmail, purpose as OtpPurpose);
  await sendOtpEmail(normalizedEmail, code);

  return Response.json({ ok: true });
}
