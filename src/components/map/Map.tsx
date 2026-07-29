"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchReports } from "@/lib/api-client";
import { StatusBadge, AidBadge } from "@/components/ui/Badges";
import type { Report } from "@/lib/db/schema";

const CHATTOGRAM_CENTER: [number, number] = [22.3384, 91.8317];

const CATEGORY_COLOR: Record<string, string> = {
  medical: "#ef4444",
  food:    "#3b82f6",
  status:  "#eab308",
};

const CATEGORY_LABEL: Record<string, string> = {
  medical: "Medical assistance",
  food:    "Food / supplies",
  status:  "Flood status",
};

const LEGEND = [
  { color: "#ef4444", label: "Medical assistance needed" },
  { color: "#3b82f6", label: "Food / supplies needed" },
  { color: "#eab308", label: "Flood status report" },
];

function createPinIcon(color: string) {
  // Google Maps-style pin: round circle head, body tapering to sharp bottom point.
  // viewBox 0 0 24 36 — head circle center at (12,11) r=9, point at (12,36).
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="36" height="54">
    <defs>
      <filter id="d" x="-50%" y="-20%" width="200%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    </defs>
    <path
      d="M12 0C5.925 0 1 4.925 1 11c0 3.274 1.394 6.22 3.614 8.29L12 36l7.386-16.71A10.956 10.956 0 0 0 23 11C23 4.925 18.075 0 12 0z"
      fill="${color}"
      filter="url(#d)"
    />
    <circle cx="12" cy="11" r="5" fill="white" opacity="0.95"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    iconSize: [36, 54],
    iconAnchor: [18, 54],
    popupAnchor: [0, -56],
    className: "",
  });
}

export default function Map() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReports()
      .then((data) => { if (!cancelled) setReports(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Could not load reports."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative flex-1 min-h-[500px]" role="region" aria-label="Live flood status map">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-bg/80">
          <p className="text-text-muted">Loading live reports...</p>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-surface border border-status-flooded rounded-md px-4 py-2 text-status-flooded text-sm">
          {error}
        </div>
      )}

      <div className="absolute bottom-8 left-4 z-[1000] bg-surface/95 border border-border rounded-lg px-3 py-2 flex flex-col gap-1.5 shadow-md">
        {LEGEND.map((l) => (
          <div key={l.color} className="flex items-center gap-2 text-xs text-text-muted">
            <span className="size-3 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} aria-hidden="true" />
            {l.label}
          </div>
        ))}
      </div>

      <MapContainer
        center={CHATTOGRAM_CENTER}
        zoom={11}
        scrollWheelZoom
        className="w-full h-full min-h-[500px]"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((r) => {
          const cat = (r as Report & { category?: string }).category ?? "status";
          const color = CATEGORY_COLOR[cat] ?? "#eab308";
          return (
            <Marker
              key={r.id}
              position={[Number(r.latitude), Number(r.longitude)]}
              icon={createPinIcon(color)}
            >
              <Popup>
                <div className="flex flex-col gap-1.5 text-sm min-w-[160px]">
                  <p className="font-semibold">{CATEGORY_LABEL[cat] ?? cat}</p>
                  <StatusBadge status={r.floodStatus} />
                  {r.aidStatus && <AidBadge status={r.aidStatus} />}
                  {r.address && <p className="text-xs text-gray-500 mt-1">{r.address}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
