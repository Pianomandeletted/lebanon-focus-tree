import { PageHeader } from "@/components/nav/PageHeader";
import { db } from "@/lib/db";

export default async function NewsPage() {
  const announcements = await db.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }]
  });

  return (
    <div>
      <PageHeader title="News &amp; Announcements" subtitle="Updates from the Roblox Lebanon development team." />
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-16 md:px-6">
        {announcements.map((a) => (
          <article key={a.id} className="rounded-lg border border-white/10 bg-cedar-900/60 p-4">
            <div className="mb-1 flex items-center gap-2">
              {a.isPinned && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-gold-light">Pinned</span>}
              <h3 className="font-display text-base text-ink-100">{a.title}</h3>
            </div>
            <p className="text-sm text-ink-300">{a.body}</p>
            <p className="mt-2 text-xs text-ink-500">{new Date(a.createdAt).toLocaleDateString()}</p>
          </article>
        ))}
        {!announcements.length && <p className="text-ink-500">No announcements yet.</p>}
      </div>
    </div>
  );
}
