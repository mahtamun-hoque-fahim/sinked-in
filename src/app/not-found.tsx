import Link from "next/link";
import { Waves } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <Waves className="size-10 text-text-faint" aria-hidden="true" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-text-muted max-w-sm">
        That page doesn&apos;t exist. If you&apos;re trying to report a
        status, use the button below.
      </p>
      <Link
        href="/"
        className="bg-accent text-bg px-4 py-2 rounded-md font-semibold hover:bg-accent-hover transition-colors min-h-[48px] flex items-center"
      >
        Back to the map
      </Link>
    </div>
  );
}
