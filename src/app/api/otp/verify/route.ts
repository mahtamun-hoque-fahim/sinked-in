import { verifyOtp, type OtpPurpose } from "@/lib/otp";
import { issueVerificationToken } from "@/lib/otp/token";

const VALID_PURPOSES: OtpPurpose[] = ["submit", "update", "admin"];

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { phone, code, purpose } = body as Record<string, unknown>;

  if (typeof phone !== "string" || !phone.trim()) {
    return Response.json({ error: "Invalid phone number" }, { status: 400 });
  }
  if (typeof code !== "string" || !/^[0-9]{6}$/.test(code.trim())) {
    return Response.json({ error: "Invalid code" }, { status: 400 });
  }
  if (typeof purpose !== "string" || !VALID_PURPOSES.includes(purpose as OtpPurpose)) {
    return Response.json({ error: "Invalid purpose" }, { status: 400 });
  }

  const normalizedPhone = phone.trim();
  const verified = await verifyOtp(normalizedPhone, code.trim(), purpose as OtpPurpose);

  if (!verified) {
    return Response.json({ error: "Incorrect or expired code" }, { status: 401 });
  }

  const token = issueVerificationToken(normalizedPhone, purpose as OtpPurpose);
  return Response.json({ verified: true, token });
}
