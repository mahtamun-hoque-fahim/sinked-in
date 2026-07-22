import Link from "next/link";
import { Waves, Info } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-border bg-surface">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-text">
          <Waves className="size-5 text-accent" aria-hidden="true" />
          Sinked In
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/about"
            className="flex items-center gap-1 text-text-muted hover:text-text transition-colors"
          >
            <Info className="size-4" aria-hidden="true" />
            About
          </Link>
          <Link
            href="/report"
            className="bg-status-flooded text-white px-4 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity min-h-[40px] flex items-center"
          >
            Report status
          </Link>
        </div>
      </nav>
    </header>
  );
}
