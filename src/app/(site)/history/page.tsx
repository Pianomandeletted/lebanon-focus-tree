import { PageHeader } from "@/components/nav/PageHeader";

export default function HistoryPage() {
  return (
    <div>
      <PageHeader title="History &amp; Timeline" subtitle="Key moments in the Roblox Lebanon project's timeline." />
      <div className="mx-auto max-w-3xl px-4 pb-16 text-ink-300 md:px-6">
        <p>
          This page is a placeholder for the project&apos;s in-universe timeline. Once announcements and focus
          completions accumulate, this is a natural place to render them chronologically - the data model already
          supports it via the Announcement and completed-Focus records.
        </p>
      </div>
    </div>
  );
}
