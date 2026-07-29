"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchReports } from "@/lib/api-client";
import { StatusBadge, AidBadge } from "@/components/ui/Badges";
import type { Report } from "@/lib/db/schema";

// Chattogram city center — Anderkilla / GEC area
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
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 46" width="32" height="46">
      <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
      </filter>
      <path
        d="M16 0C7.163 0 0 7.163 0 16c0 10.5 14 29 15.3 30.7a.9.9 0 001.4 0C18 44.9 32 26.5 32 16 32 7.163 24.837 0 16 0z"
        fill="${color}"
        filter="url(#shadow)"
        stroke="white"
        stroke-width="1.5"
      />
      <circle cx="16" cy="15" r="6" fill="white" fill-opacity="0.95"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    iconSize: [32, 46],
    iconAnchor: [16, 46],
    popupAnchor: [0, -48],
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

      {/* Legend */}
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
                  <p className="font-semibold text-base">{CATEGORY_LABEL[cat] ?? cat}</p>
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
