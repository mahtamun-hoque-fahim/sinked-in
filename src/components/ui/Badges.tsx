const FLOOD_LABELS: Record<string, string> = {
  flooded: "FLOODED",
  safe: "SAFE",
  not_in_danger: "FLOODED, NOT IN DANGER",
};

const FLOOD_COLOR_CLASS: Record<string, string> = {
  flooded: "bg-status-flooded/15 text-status-flooded",
  safe: "bg-status-safe/15 text-status-safe",
  not_in_danger: "bg-status-not-in-danger/15 text-status-not-in-danger",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium ${FLOOD_COLOR_CLASS[status] ?? ""}`}
    >
      {FLOOD_LABELS[status] ?? status}
    </span>
  );
}

const AID_LABELS: Record<string, string> = {
  needs_aid: "NEEDS AID",
  in_progress: "AID IN PROGRESS",
  aided: "AIDED",
};

const AID_COLOR_CLASS: Record<string, string> = {
  needs_aid: "bg-aid-needed/15 text-aid-needed",
  in_progress: "bg-aid-in-progress/15 text-aid-in-progress",
  aided: "bg-aid-complete/15 text-aid-complete",
};

export function AidBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium ${AID_COLOR_CLASS[status] ?? ""}`}
    >
      {AID_LABELS[status] ?? status}
    </span>
  );
}
