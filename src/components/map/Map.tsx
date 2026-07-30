"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { fetchReports } from "@/lib/api-client";
import type { Report } from "@/lib/db/schema";

const CHATTOGRAM_CENTER: [number, number] = [22.3384, 91.8317];
const ZOOM = 11;

const CATEGORY_COLOR: Record<string, string> = {
  medical: "#ef4444",
  food:    "#3b82f6",
  status:  "#eab308",
};

const CATEGORY_LABEL: Record<string, string> = {
  medical: "Medical assistance needed",
  food:    "Food / supplies needed",
  status:  "Flood status report",
};

const LEGEND = [
  { color: "#ef4444", label: "Medical assistance" },
  { color: "#3b82f6", label: "Food / supplies" },
  { color: "#eab308", label: "Flood status" },
];

const FLOOD_LABEL: Record<string, string> = {
  flooded:       "Flooded",
  safe:          "Safe",
  not_in_danger: "Flooded, not in danger",
};
const FLOOD_COLOR: Record<string, string> = {
  flooded:       "#ef4444",
  safe:          "#22c55e",
  not_in_danger: "#eab308",
};
const AID_LABEL: Record<string, string> = {
  needs_aid:   "Needs aid",
  in_progress: "Aid in progress",
  aided:       "Aided",
};
const AID_COLOR: Record<string, string> = {
  needs_aid:   "#f97316",
  in_progress: "#3b82f6",
  aided:       "#3dd6c4",
};

// Inline styles on the SVG + explicit iconSize so Leaflet never shrinks it.
function createPinIcon(color: string) {
  const html = `
    <div style="width:36px;height:54px;display:block;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36"
           style="width:36px;height:54px;display:block;overflow:visible;">
        <defs>
          <filter id="sh" x="-50%" y="-20%" width="200%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5"
              flood-color="#000" flood-opacity="0.45"/>
          </filter>
        </defs>
        <path
          d="M12 0C5.925 0 1 4.925 1 11c0 3.274 1.394 6.22 3.614 8.29L12 36l7.386-16.71A10.956 10.956 0 0 0 23 11C23 4.925 18.075 0 12 0z"
          fill="${color}" filter="url(#sh)"
        />
        <circle cx="12" cy="11" r="5" fill="white" opacity="0.95"/>
      </svg>
    </div>`;

  return L.divIcon({
    html,
    iconSize:     [36, 54],
    iconAnchor:   [18, 54],
    popupAnchor:  [0, -56],
    className:    "sinked-pin",
  });
}

function buildPopupHtml(r: Report & { category?: string }): string {
  const cat      = r.category ?? "status";
  const catColor = CATEGORY_COLOR[cat] ?? "#eab308";
  const catLabel = CATEGORY_LABEL[cat] ?? cat;

  const fColor = FLOOD_COLOR[r.floodStatus] ?? "#fff";
  const fLabel = FLOOD_LABEL[r.floodStatus] ?? r.floodStatus;

  const aidHtml = r.aidStatus
    ? `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;
        background:${AID_COLOR[r.aidStatus]}22;color:${AID_COLOR[r.aidStatus]};">
        ${AID_LABEL[r.aidStatus] ?? r.aidStatus}</span>`
    : "";

  const addrHtml = r.address
    ? `<p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${r.address}</p>`
    : "";

  const timeHtml = r.createdAt
    ? `<p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">
        Reported ${new Date(r.createdAt).toLocaleDateString("en-GB",
          { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}</p>`
    : "";

  return `
    <div style="font-family:sans-serif;min-width:200px;max-width:240px;">
      <div style="background:${catColor}18;border-left:3px solid ${catColor};
                  padding:8px 10px 6px;margin-bottom:8px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#111;">${catLabel}</p>
      </div>
      <div style="padding:0 10px 10px;display:flex;flex-direction:column;gap:5px;">
        <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;
            font-weight:600;background:${fColor}22;color:${fColor};">${fLabel}</span>
        ${aidHtml}
        ${addrHtml}
        ${timeHtml}
        <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:6px;">
          Contact info visible to verified responders only.</p>
      </div>
    </div>`;
}

export default function Map() {
  const [reports, setReports] = useState<(Report & { category?: string })[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReports()
      .then((d) => { if (!cancelled) setReports(d as (Report & { category?: string })[]); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load reports."); })
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
            <span className="size-3 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      <MapContainer
        center={CHATTOGRAM_CENTER}
        zoom={ZOOM}
        scrollWheelZoom
        className="w-full h-full min-h-[500px]"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((r) => {
          const cat   = r.category ?? "status";
          const color = CATEGORY_COLOR[cat] ?? "#eab308";
          return (
            <Marker
              key={r.id}
              position={[Number(r.latitude), Number(r.longitude)]}
              icon={createPinIcon(color)}
            >
              <Popup maxWidth={260}>
                <div dangerouslySetInnerHTML={{ __html: buildPopupHtml(r) }} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
