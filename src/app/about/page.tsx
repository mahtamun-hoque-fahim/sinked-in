export const metadata = { title: "About — Sinked In" };

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-10 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">About Sinked In</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Why this exists</h2>
        <p className="text-text-muted">
          In a flood, water is everywhere but not everyone needs aid — yet aid
          organizations can&apos;t tell the difference from the road. Relief gets
          front-loaded onto easy-to-reach households near the entrance of a
          flooded area, and runs out before it reaches the people at the end
          of the road who are worst off. Sinked In exists to close that gap
          for Chattogram.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-text-muted">
          Anyone can view the live map with no account and no signup. If you
          or a neighbor need to report a status, you provide a phone number
          (so responders can call you) and an email (to receive a one-time
          verification code). No password, no persistent account — the code
          only proves you&apos;re a real person submitting the report.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Data use</h2>
        <p className="text-text-muted">
          Your phone number is visible only to verified responders using the
          admin view, so they can call you. It is never shown on the public
          map. Your email is used only to deliver your verification code.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Cost</h2>
        <p className="text-text-muted">
          Sinked In is free forever, for everyone, in every form. It always
          will be.
        </p>
      </section>
    </div>
  );
}
