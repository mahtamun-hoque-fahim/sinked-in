import type { Report } from "@/lib/db/schema";

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export async function sendOtp(phone: string, email: string, purpose: "submit" | "update" | "admin") {
  const res = await fetch("/api/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, email, purpose }),
  });
  return parseJson(res);
}

export async function verifyOtpCode(
  phone: string,
  code: string,
  purpose: "submit" | "update" | "admin",
): Promise<{ verified: true; token: string }> {
  const res = await fetch("/api/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code, purpose }),
  });
  return parseJson(res);
}

export async function fetchReports(): Promise<Report[]> {
  const res = await fetch("/api/reports");
  return parseJson(res);
}

export async function submitReport(params: {
  phone: string;
  email: string;
  token: string;
  floodStatus: string;
  latitude: number;
  longitude: number;
  address?: string;
  photoUrl?: string;
  isProxy: boolean;
}): Promise<Report> {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return parseJson(res);
}

export async function lookupReports(phone: string, token: string): Promise<Report[]> {
  const res = await fetch(`/api/reports/lookup?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}`);
  return parseJson(res);
}

export async function updateReport(params: {
  id: string;
  phone: string;
  token: string;
  floodStatus?: string;
  aidStatus?: string;
}): Promise<Report> {
  const { id, ...body } = params;
  const res = await fetch(`/api/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}
