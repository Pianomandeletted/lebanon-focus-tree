import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [focusCount, pathCount, statCount, trackCount, announcementCount] = await Promise.all([
    db.focus.count(),
    db.path.count(),
    db.statistic.count(),
    db.musicTrack.count(),
    db.announcement.count()
  ]);

  const cards = [
    { href: "/admin/focuses", label: "Focuses", count: focusCount },
    { href: "/admin/paths", label: "Paths", count: pathCount },
    { href: "/admin/stats", label: "Statistics", count: statCount },
    { href: "/admin/music", label: "Music tracks", count: trackCount },
    { href: "/admin/announcements", label: "Announcements", count: announcementCount }
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-100">Admin dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-lg border border-white/10 bg-cedar-900/60 p-4 hover:border-white/20">
            <p className="text-xs uppercase tracking-wide text-ink-500">{c.label}</p>
            <p className="mt-1 font-display text-3xl text-ink-100">{c.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
