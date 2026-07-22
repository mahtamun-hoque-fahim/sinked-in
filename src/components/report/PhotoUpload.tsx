"use client";

import { useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";

export default function PhotoUpload({
  photoUrl,
  onChange,
}: {
  photoUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const sigRes = await fetch("/api/upload-signature", { method: "POST" });
      const sigData = await sigRes.json();
      if (!sigRes.ok) {
        throw new Error(sigData.error ?? "Photo upload is not available right now");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", String(sigData.timestamp));
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message ?? "Upload failed");
      }

      onChange(uploadData.secure_url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text-muted">Photo (optional)</span>

      {photoUrl ? (
        <div className="relative w-full max-w-[240px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Report photo"
            className="w-full h-auto rounded-md border border-border"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-bg/80 rounded-full p-1.5 hover:bg-bg transition-colors"
            aria-label="Remove photo"
          >
            <X className="size-4 text-text" />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 bg-surface border border-border border-dashed rounded-md px-4 py-3 min-h-[48px] cursor-pointer text-text-muted hover:bg-surface-elevated transition-colors">
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="size-4" aria-hidden="true" />
              Add a photo
            </>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      )}

      {error && <p className="text-status-flooded text-sm">{error}</p>}
    </div>
  );
}
