import { Resend } from "resend";

// OTP is delivered by email until a sponsor funds SMS costs. Phone number
// is still collected and is still the callback contact for responders —
// this only changes the OTP delivery channel. See BRAIN.md Core Decisions
// (2026-07-21) and AGENTS.md Conventions.
export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_ADDRESS ?? "Sinked In <verify@sinkedin.app>";

  await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: `Your Sinked In verification code: ${code}`,
    text: [
      `Your verification code is ${code}.`,
      "",
      `This code expires in 10 minutes. If you did not request this, you can ignore this email.`,
    ].join("\n"),
  });
}
