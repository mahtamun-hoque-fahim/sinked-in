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

// Classic Google Maps-style location pin:
// large circle head, body narrowing to a sharp point at the bottom.
function createPinIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 42" width="30" height="42">
    <defs>
      <filter id="s" x="-40%" y="-10%" width="180%" height="150%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
      </filter>
    </defs>
    <path
      d="M15 0C8.373 0 3 5.373 3 12c0 8.5 11 28 12 30 1-2 12-21.5 12-30C27 5.373 21.627 0 15 0z"
      fill="${color}"
      filter="url(#s)"
      stroke="white"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <circle cx="15" cy="12" r="5.5" fill="white" opacity="0.95"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -44],
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
