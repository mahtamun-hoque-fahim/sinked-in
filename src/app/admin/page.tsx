"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/ui/OtpInput";
import { StatusBadge, AidBadge } from "@/components/ui/Badges";
import { sendOtp, verifyOtpCode } from "@/lib/api-client";
import type { Report } from "@/lib/db/schema";

type Step = "login" | "verify" | "dashboard";

const AID_OPTIONS = [
  { value: "needs_aid", label: "Needs aid" },
  { value: "in_progress", label: "In progress" },
  { value: "aided", label: "Aided" },
] as const;

export default function AdminPage() {
  const [step, setStep] = useState<Step>("login");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendOtp(phone.trim(), email.trim(), "admin");
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function loadReports(activeToken: string) {
    const res = await fetch(
      `/api/admin/reports?phone=${encodeURIComponent(phone.trim())}&email=${encodeURIComponent(email.trim())}&token=${encodeURIComponent(activeToken)}`,
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load reports");
    setReports(data);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token: newToken } = await verifyOtpCode(phone.trim(), code, "admin");
      setToken(newToken);
      await loadReports(newToken);
      setStep("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. You may not be on the admin allowlist.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAidUpdate(id: string, aidStatus: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), email: email.trim(), token, aidStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setReports((prev) => prev.map((r) => (r.id === id ? data : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (step === "dashboard") {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Report feed</h1>
        {error && <p className="text-status-flooded text-sm">{error}</p>}
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={r.floodStatus} />
                {r.aidStatus && <AidBadge status={r.aidStatus} />}
                {r.isProxy && <span className="text-xs text-text-faint">proxy report</span>}
              </div>
              <p className="text-sm font-mono text-text-muted">{r.phone}</p>
              <p className="text-sm text-text-muted">{r.address || `${r.latitude}, ${r.longitude}`}</p>
              <div className="flex gap-2 flex-wrap">
                {AID_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAidUpdate(r.id, opt.value)}
                    className={`px-3 py-2 rounded-md text-sm border transition-colors min-h-[48px] ${
                      r.aidStatus === opt.value
                        ? "bg-accent text-bg border-accent"
                        : "bg-bg text-text border-border hover:bg-surface-elevated"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto w-full px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      {step === "login" && (
        <form onSubmit={handleSendCode} className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
          <Input id="phone" label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <p className="text-status-flooded text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? "Sending code..." : "Send verification code"}</Button>
        </form>
      )}
      {step === "verify" && (
        <form onSubmit={handleVerify} className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-sm text-text-muted">We emailed a 6-digit code to {email}.</p>
          <OtpInput value={code} onChange={setCode} />
          {error && <p className="text-status-flooded text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify"}</Button>
        </form>
      )}
    </div>
  );
}
