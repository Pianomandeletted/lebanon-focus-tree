"use client";

import { useEffect, useState } from "react";

type Announcement = { id: string; title: string; body: string; isPinned: boolean; createdAt: string };
const EMPTY = { title: "", body: "", isPinned: false };

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(EMPTY);

  async function refresh() {
    setItems(await (await fetch("/api/announcements")).json());
  }
  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm(EMPTY);
    refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-100">Announcements</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-lg border border-white/10 bg-cedar-900/60 p-4">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-display text-base text-ink-100">
                  {a.isPinned && <span className="mr-2 text-xs text-gold-light">[Pinned]</span>}
                  {a.title}
                </h3>
                <button onClick={() => onDelete(a.id)} className="text-xs text-status-impossible hover:underline">
                  Delete
                </button>
              </div>
              <p className="text-sm text-ink-300">{a.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-lg border border-white/10 bg-cedar-900/60 p-4">
          <h2 className="font-display text-lg text-ink-100">New announcement</h2>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Body</span>
            <textarea
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
            />
            Pin to top
          </label>
          <button type="submit" className="w-full rounded-md bg-gold px-3 py-2 text-sm font-medium text-cedar-950 hover:bg-gold-light">
            Publish
          </button>
        </form>
      </div>
    </div>
  );
}
