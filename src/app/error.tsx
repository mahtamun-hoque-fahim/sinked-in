"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-status-flooded">
        Something went wrong
      </h1>
      <p className="text-text-muted max-w-sm">
        This didn&apos;t work as expected. Your report, if you were
        submitting one, was not saved.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
