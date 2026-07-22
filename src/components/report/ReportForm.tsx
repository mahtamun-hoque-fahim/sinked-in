"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/ui/OtpInput";
import { sendOtp, verifyOtpCode, submitReport } from "@/lib/api-client";

type Step = "details" | "verify" | "confirmed";

const FLOOD_OPTIONS = [
  { value: "flooded", label: "Flooded" },
  { value: "not_in_danger", label: "Flooded, not in danger" },
  { value: "safe", label: "Safe / not flooded" },
] as const;

export default function ReportForm({ isProxy = false }: { isProxy?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [floodStatus, setFloodStatus] = useState<string>("flooded");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedPhone, setConfirmedPhone] = useState("");

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => setError("Could not get your location. Enter an address instead."),
    );
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phone.trim() || !email.trim()) {
      setError("Phone and email are required.");
      return;
    }
    if (!latitude || !longitude) {
      setError("Location is required — use current location or enter coordinates.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone.trim(), email.trim(), "submit");
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
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const { token } = await verifyOtpCode(phone.trim(), code, "submit");
      await submitReport({
        phone: phone.trim(),
        email: email.trim(),
        token,
        floodStatus,
        latitude: Number(latitude),
        longitude: Number(longitude),
        address: address.trim() || undefined,
        isProxy,
      });
      setConfirmedPhone(phone.trim());
      setStep("confirmed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "confirmed") {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-status-safe">Your report is live</h2>
        <p className="text-lg text-text-muted">
          Responders can reach {isProxy ? "you" : "you"} at {confirmedPhone}.
        </p>
        <Button variant="secondary" onClick={() => router.push("/")}>
          View the map
        </Button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">Enter your verification code</h2>
          <p className="text-sm text-text-muted mt-1">
            We emailed a 6-digit code to {email}.
          </p>
        </div>
        <OtpInput value={code} onChange={setCode} />
        {error && <p className="text-status-flooded text-sm">{error}</p>}
        <Button type="submit" variant="emergency" disabled={loading}>
          {loading ? "Verifying..." : "Verify and submit report"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-text-muted mb-1">Status</legend>
        <div className="flex flex-col gap-2">
          {FLOOD_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 bg-bg border border-border rounded-md px-3 py-2 min-h-[48px] cursor-pointer"
            >
              <input
                type="radio"
                name="floodStatus"
                value={opt.value}
                checked={floodStatus === opt.value}
                onChange={() => setFloodStatus(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-muted">Location</span>
        <Button type="button" variant="secondary" onClick={useMyLocation}>
          Use my current location
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="latitude"
            label="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="22.3569"
          />
          <Input
            id="longitude"
            label="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="91.7832"
          />
        </div>
        <Input
          id="address"
          label="Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Road / area name"
        />
      </div>

      <Input
        id="phone"
        label={isProxy ? "Your phone number (the reporter's, not the neighbor's)" : "Your phone number"}
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+8801..."
      />
      <Input
        id="email"
        label="Email (for your verification code)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      {error && <p className="text-status-flooded text-sm">{error}</p>}

      <Button type="submit" variant="emergency" disabled={loading}>
        {loading ? "Sending code..." : "Send verification code"}
      </Button>
    </form>
  );
}
