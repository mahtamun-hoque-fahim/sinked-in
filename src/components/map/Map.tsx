"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchReports } from "@/lib/api-client";
import { StatusBadge, AidBadge } from "@/components/ui/Badges";
import type { Report } from "@/lib/db/schema";

const CHATTOGRAM_CENTER: [number, number] = [22.3569, 91.7832];

// Pin color is determined by category, not flood status.
// category drives the triage color on the map for responders.
const CATEGORY_COLOR: Record<string, string> = {
  medical: "#ef4444", // red
  food:    "#3b82f6", // blue
  status:  "#eab308", // yellow
};

const LEGEND = [
  { color: "#ef4444", label: "Medical assistance needed" },
  { color: "#3b82f6", label: "Food / supplies needed" },
  { color: "#eab308", label: "Flood status report" },
];

const CATEGORY_LABEL: Record<string, string> = {
  medical: "Medical assistance",
  food:    "Food / supplies",
  status:  "Flood status",
};

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
      <div className="absolute bottom-8 left-4 z-[1000] bg-surface/95 border border-border rounded-lg px-3 py-2 flex flex-col gap-1.5">
        {LEGEND.map((l) => (
          <div key={l.color} className="flex items-center gap-2 text-xs text-text-muted">
            <span
              className="size-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: l.color }}
              aria-hidden="true"
            />
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
            <CircleMarker
              key={r.id}
              center={[Number(r.latitude), Number(r.longitude)]}
              radius={8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.75, weight: 2 }}
            >
              <Popup>
                <div className="flex flex-col gap-1 text-sm min-w-[140px]">
                  <p className="font-semibold">{CATEGORY_LABEL[cat] ?? cat}</p>
                  <StatusBadge status={r.floodStatus} />
                  {r.aidStatus && <AidBadge status={r.aidStatus} />}
                  {r.address && <p className="text-xs text-gray-500 mt-1">{r.address}</p>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
