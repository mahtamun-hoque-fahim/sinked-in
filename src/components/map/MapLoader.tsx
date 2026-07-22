"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 min-h-[500px] flex items-center justify-center bg-surface">
      <p className="text-text-muted">Loading map...</p>
    </div>
  ),
});

export default function MapLoader() {
  return <Map />;
}
