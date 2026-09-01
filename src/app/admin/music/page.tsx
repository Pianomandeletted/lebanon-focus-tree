"use client";

import { useEffect, useState } from "react";

type Track = { id: string; title: string; artist: string; url: string; order: number; isEnabled: boolean };
const EMPTY = { id: "", title: "", artist: "", url: "", order: 0, isEnabled: true };

export default function AdminMusicPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [form, setForm] = useState(EMPTY);

  async function refresh() {
    setTracks(await (await fetch("/api/music")).json());
  }
  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(form.id ? `/api/music/${form.id}` : "/api/music", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm(EMPTY);
    refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this track?")) return;
    await fetch(`/api/music/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-100">Music</h1>
      <p className="mb-4 max-w-2xl text-sm text-ink-500">
        Add a direct URL to each audio file (host them under /public/audio in the project, or on a CDN/blob store).
        Disabled tracks are hidden from the player but stay in the playlist here.
      </p>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-cedar-900/80 text-left text-ink-500">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Enabled</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {tracks.map((t) => (
                <tr key={t.id} className="border-t border-white/5 hover:bg-cedar-900/40">
                  <td className="px-3 py-2 text-ink-100">{t.title}</td>
                  <td className="px-3 py-2 text-ink-300">{t.isEnabled ? "Yes" : "No"}</td>
                  <td className="space-x-2 px-3 py-2 text-right">
                    <button onClick={() => setForm(t)} className="text-gold-light hover:underline">
                      Edit
                    </button>
                    <button onClick={() => onDelete(t.id)} className="text-status-impossible hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-lg border border-white/10 bg-cedar-900/60 p-4">
          <h2 className="font-display text-lg text-ink-100">{form.id ? "Edit track" : "New track"}</h2>
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
            <span className="mb-1 block text-ink-300">Artist</span>
            <input
              value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Audio URL</span>
            <input
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="/audio/track.mp3"
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
            />
            Enabled
          </label>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 rounded-md bg-gold px-3 py-2 text-sm font-medium text-cedar-950 hover:bg-gold-light">
              {form.id ? "Save changes" : "Add track"}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm(EMPTY)} className="rounded-md border border-white/10 px-3 py-2 text-sm text-ink-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
