import { createHash } from "crypto";

// Signed direct-to-Cloudinary upload: the client uploads the file straight
// to Cloudinary using a short-lived signature from this server, so the
// photo never passes through our own serverless function. Standard
// Cloudinary pattern for signed uploads.
export function generateUploadSignature(): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error("Cloudinary env vars are not set");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "sinked-in-reports";

  // Params to sign must be sorted alphabetically by key, joined as
  // key=value pairs with &, then the api_secret appended — no other
  // params (file, api_key, cloud_name, signature) are included.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(paramsToSign).digest("hex");

  return { signature, timestamp, apiKey, cloudName, folder };
}
