import ReportForm from "@/components/report/ReportForm";

export const metadata = { title: "Report for a neighbor — Sinked In" };

export default function ProxyReportPage() {
  return (
    <div className="max-w-md mx-auto w-full px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Report for a neighbor</h1>
        <p className="text-text-muted mt-1">
          Use your own phone and email — never a fabricated number for the
          person you&apos;re reporting on. Responders will call you.
        </p>
      </div>
      <ReportForm isProxy />
    </div>
  );
}
