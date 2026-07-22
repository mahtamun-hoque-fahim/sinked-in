import { generateUploadSignature } from "@/lib/cloudinary";

// No OTP gate here — a signature alone cannot create a report, it only
// permits a single scoped upload to Cloudinary. The photo URL still has
// to be attached to a report via /api/reports, which is OTP-gated.
export async function POST() {
  try {
    const data = generateUploadSignature();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Photo upload is not configured yet" }, { status: 503 });
  }
}
