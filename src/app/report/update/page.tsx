"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/ui/OtpInput";
import { StatusBadge, AidBadge } from "@/components/ui/Badges";
import { sendOtp, verifyOtpCode, lookupReports, updateReport } from "@/lib/api-client";
import type { Report } from "@/lib/db/schema";

type Step = "phone" | "verify" | "results";

const FLOOD_OPTIONS = [
  { value: "flooded", label: "Flooded" },
  { value: "not_in_danger", label: "Flooded, not in danger" },
  { value: "safe", label: "Safe / not flooded" },
] as const;

export default function ReportUpdatePage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phone.trim() || !email.trim()) {
      setError("Phone and email are required.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone.trim(), email.trim(), "update");
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token: newToken } = await verifyOtpCode(phone.trim(), code, "update");
      setToken(newToken);
      const found = await lookupReports(phone.trim(), newToken);
      setReports(found);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string, newFloodStatus: string) {
    setError(null);
    setSavedId(null);
    try {
      const updated = await updateReport({ id, phone: phone.trim(), token, floodStatus: newFloodStatus });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setSavedId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Update your report</h1>
        <p className="text-text-muted mt-1">
          Reports are matched by phone number. Verify again to update.
        </p>
      </div>

      {step === "phone" && (
        <form onSubmit={handleSendCode} className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
          <Input id="phone" label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801..." />
          <Input id="email" label="Email (for your verification code)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {error && <p className="text-status-flooded text-sm">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Sending code..." : "Send verification code"}
          </Button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerify} className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-sm text-text-muted">We emailed a 6-digit code to {email}.</p>
          <OtpInput value={code} onChange={setCode} />
          {error && <p className="text-status-flooded text-sm">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      )}

      {step === "results" && (
        <div className="flex flex-col gap-4">
          {reports.length === 0 && (
            <p className="text-text-muted">No reports found for this phone number.</p>
          )}
          {reports.map((r) => (
            <div key={r.id} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={r.floodStatus} />
                {r.aidStatus && <AidBadge status={r.aidStatus} />}
              </div>
              <p className="text-sm text-text-muted">{r.address || `${r.latitude}, ${r.longitude}`}</p>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-muted">Update status</span>
                <div className="flex gap-2 flex-wrap">
                  {FLOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleUpdate(r.id, opt.value)}
                      className={`px-3 py-2 rounded-md text-sm border transition-colors min-h-[40px] ${
                        r.floodStatus === opt.value
                          ? "bg-accent text-bg border-accent"
                          : "bg-bg text-text border-border hover:bg-surface-elevated"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {savedId === r.id && <p className="text-status-safe text-sm">Updated.</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
