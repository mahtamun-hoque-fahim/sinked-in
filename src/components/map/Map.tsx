"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchReports } from "@/lib/api-client";
import { StatusBadge, AidBadge } from "@/components/ui/Badges";
import type { Report } from "@/lib/db/schema";

// Default center: Chattogram, Bangladesh.
const CHATTOGRAM_CENTER: [number, number] = [22.3569, 91.7832];

const STATUS_COLOR: Record<string, string> = {
  flooded: "#ef4444",
  safe: "#22c55e",
  not_in_danger: "#eab308",
};

export default function Map() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReports()
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load reports.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
      <MapContainer
        center={CHATTOGRAM_CENTER}
        zoom={12}
        scrollWheelZoom
        className="w-full h-full min-h-[500px]"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((r) => (
          <CircleMarker
            key={r.id}
            center={[Number(r.latitude), Number(r.longitude)]}
            radius={10}
            pathOptions={{
              color: STATUS_COLOR[r.floodStatus] ?? "#3dd6c4",
              fillColor: STATUS_COLOR[r.floodStatus] ?? "#3dd6c4",
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <StatusBadge status={r.floodStatus} />
                {r.aidStatus && <AidBadge status={r.aidStatus} />}
                {r.address && <p className="text-xs mt-1">{r.address}</p>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
