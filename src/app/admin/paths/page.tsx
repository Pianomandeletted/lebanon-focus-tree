"use client";

import { useEffect, useState } from "react";
import type { PathDTO } from "@/types/focus";

const EMPTY = {
  id: "",
  slug: "",
  name: "",
  description: "",
  color: "#C9A24B",
  category: "faction" as "faction" | "diplomacy" | "national",
  order: 0,
  parentPathId: "" as string | null
};

export default function AdminPathsPage() {
  const [paths, setPaths] = useState<PathDTO[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setPaths(await (await fetch("/api/paths")).json());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { ...form, parentPathId: form.parentPathId || null };
    const res = await fetch(form.id ? `/api/paths/${form.id}` : "/api/paths", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      setError("Save failed - slug may already be in use.");
      return;
    }
    setForm(EMPTY);
    refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this path and every focus inside it?")) return;
    await fetch(`/api/paths/${id}`, { method: "DELETE" });
    if (form.id === id) setForm(EMPTY);
    refresh();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-100">Paths</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-cedar-900/80 text-left text-ink-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {paths.map((p) => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-cedar-900/40">
                  <td className="flex items-center gap-2 px-3 py-2 text-ink-100">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </td>
                  <td className="px-3 py-2 text-ink-300">{p.category}</td>
                  <td className="space-x-2 px-3 py-2 text-right">
                    <button
                      onClick={() =>
                        setForm({
                          id: p.id,
                          slug: p.slug,
                          name: p.name,
                          description: p.description,
                          color: p.color,
                          category: p.category,
                          order: p.order,
                          parentPathId: p.parentPathId
                        })
                      }
                      className="text-gold-light hover:underline"
                    >
                      Edit
                    </button>
                    <button onClick={() => onDelete(p.id)} className="text-status-impossible hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-lg border border-white/10 bg-cedar-900/60 p-4">
          <h2 className="font-display text-lg text-ink-100">{form.id ? "Edit path" : "New path"}</h2>
          {error && <p className="text-sm text-status-impossible">{error}</p>}

          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Slug (unique)</span>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-ink-300">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
              >
                <option value="faction">Faction</option>
                <option value="diplomacy">Diplomacy</option>
                <option value="national">National</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-300">Color</span>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-full rounded-md border border-white/10 bg-cedar-950"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Parent path (for nested branches, e.g. Chamounist under NLP)</span>
            <select
              value={form.parentPathId ?? ""}
              onChange={(e) => setForm({ ...form, parentPathId: e.target.value || null })}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            >
              <option value="">None</option>
              {paths
                .filter((p) => p.id !== form.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-gold px-3 py-2 text-sm font-medium text-cedar-950 hover:bg-gold-light"
            >
              {form.id ? "Save changes" : "Create path"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(EMPTY)}
                className="rounded-md border border-white/10 px-3 py-2 text-sm text-ink-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
