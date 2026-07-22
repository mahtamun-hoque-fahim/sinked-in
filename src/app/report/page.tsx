import Link from "next/link";
import ReportForm from "@/components/report/ReportForm";

export const metadata = { title: "Report your status — Sinked In" };

export default function ReportPage() {
  return (
    <div className="max-w-md mx-auto w-full px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Report your status</h1>
        <p className="text-text-muted mt-1">
          Takes under a minute. No account needed.
        </p>
      </div>
      <ReportForm />
      <p className="text-sm text-text-muted text-center">
        Reporting for someone without a phone?{" "}
        <Link href="/report/proxy" className="text-accent hover:underline">
          Report on their behalf
        </Link>
      </p>
    </div>
  );
}
