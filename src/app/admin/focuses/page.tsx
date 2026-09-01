"use client";

import { useEffect, useMemo, useState } from "react";
import type { FocusDTO, PathDTO, FocusStatus } from "@/types/focus";

const EMPTY_FORM = {
  id: "",
  slug: "",
  title: "",
  description: "",
  status: "INCOMPLETE" as FocusStatus,
  pathId: "",
  x: 0,
  y: 0,
  iconUrl: "" as string | null,
  requirementsText: "",
  completionText: "",
  requiresFocusIds: [] as string[]
};

export default function AdminFocusesPage() {
  const [paths, setPaths] = useState<PathDTO[]>([]);
  const [focuses, setFocuses] = useState<FocusDTO[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pathFilter, setPathFilter] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const [pathsRes, focusesRes] = await Promise.all([fetch("/api/paths"), fetch("/api/focuses")]);
    setPaths(await pathsRes.json());
    const data = await focusesRes.json();
    setFocuses(data.focuses);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredFocuses = useMemo(
    () => (pathFilter ? focuses.filter((f) => f.pathId === pathFilter) : focuses),
    [focuses, pathFilter]
  );

  function loadIntoForm(f: FocusDTO) {
    setForm({
      id: f.id,
      slug: f.slug,
      title: f.title,
      description: f.description,
      status: f.status,
      pathId: f.pathId,
      x: f.x,
      y: f.y,
      iconUrl: f.iconUrl,
      requirementsText: f.requirements.join("\n"),
      completionText: f.completionText,
      requiresFocusIds: f.incoming
    });
  }

  async function onUploadIcon(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    setUploading(false);
    if (!res.ok) {
      setError("Icon upload failed.");
      return;
    }
    const { url } = await res.json();
    setForm((f) => ({ ...f, iconUrl: url }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      slug: form.slug,
      title: form.title,
      description: form.description,
      status: form.status,
      pathId: form.pathId,
      x: Number(form.x),
      y: Number(form.y),
      iconUrl: form.iconUrl || null,
      requirements: form.requirementsText.split("\n").map((s) => s.trim()).filter(Boolean),
      completionText: form.completionText,
      requiresFocusIds: form.requiresFocusIds
    };

    const res = await fetch(form.id ? `/api/focuses/${form.id}` : "/api/focuses", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSaving(false);
    if (!res.ok) {
      setError("Save failed - check required fields.");
      return;
    }
    setForm(EMPTY_FORM);
    refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this focus? Connections to and from it will also be removed.")) return;
    await fetch(`/api/focuses/${id}`, { method: "DELETE" });
    if (form.id === id) setForm(EMPTY_FORM);
    refresh();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-100">Focuses</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <select
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            className="mb-3 w-full rounded-md border border-white/10 bg-cedar-900 px-3 py-2 text-sm text-ink-100"
          >
            <option value="">All paths</option>
            {paths.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-cedar-900/80 text-left text-ink-500">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Path</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filteredFocuses.map((f) => (
                  <tr key={f.id} className="border-t border-white/5 hover:bg-cedar-900/40">
                    <td className="px-3 py-2 text-ink-100">{f.title}</td>
                    <td className="px-3 py-2 text-ink-300">{f.status}</td>
                    <td className="px-3 py-2 text-ink-300">
                      {paths.find((p) => p.id === f.pathId)?.name ?? "—"}
                    </td>
                    <td className="space-x-2 px-3 py-2 text-right">
                      <button onClick={() => loadIntoForm(f)} className="text-gold-light hover:underline">
                        Edit
                      </button>
                      <button onClick={() => onDelete(f.id)} className="text-status-impossible hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-lg border border-white/10 bg-cedar-900/60 p-4">
          <h2 className="font-display text-lg text-ink-100">{form.id ? "Edit focus" : "New focus"}</h2>
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
            <span className="mb-1 block text-ink-300">Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-ink-300">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FocusStatus })}
                className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
              >
                <option value="COMPLETE">Complete</option>
                <option value="COMPLETING">Completing</option>
                <option value="INCOMPLETE">Incomplete</option>
                <option value="IMPOSSIBLE">Impossible</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-ink-300">Path</span>
              <select
                required
                value={form.pathId}
                onChange={(e) => setForm({ ...form, pathId: e.target.value })}
                className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
              >
                <option value="">Select a path</option>
                {paths.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-ink-300">X position</span>
              <input
                type="number"
                value={form.x}
                onChange={(e) => setForm({ ...form, x: Number(e.target.value) })}
                className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-300">Y position</span>
              <input
                type="number"
                value={form.y}
                onChange={(e) => setForm({ ...form, y: Number(e.target.value) })}
                className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Icon</span>
            <input type="file" accept="image/*" onChange={onUploadIcon} className="w-full text-xs text-ink-300" />
            {uploading && <span className="text-xs text-ink-500">Uploading...</span>}
            {form.iconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.iconUrl} alt="" className="mt-2 h-10 w-10 rounded object-cover" />
            )}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Requirements (one per line)</span>
            <textarea
              value={form.requirementsText}
              onChange={(e) => setForm({ ...form, requirementsText: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Completion text</span>
            <textarea
              value={form.completionText}
              onChange={(e) => setForm({ ...form, completionText: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>

          <div className="block text-sm">
            <span className="mb-1 block text-ink-300">Prerequisite focuses</span>
            <div className="max-h-40 overflow-y-auto rounded-md border border-white/10 bg-cedar-950 p-2">
              {focuses
                .filter((f) => f.id !== form.id)
                .map((f) => (
                  <label key={f.id} className="flex items-center gap-2 py-0.5 text-xs text-ink-300">
                    <input
                      type="checkbox"
                      checked={form.requiresFocusIds.includes(f.id)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          requiresFocusIds: e.target.checked
                            ? [...prev.requiresFocusIds, f.id]
                            : prev.requiresFocusIds.filter((id) => id !== f.id)
                        }))
                      }
                    />
                    {f.title}
                  </label>
                ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-gold px-3 py-2 text-sm font-medium text-cedar-950 hover:bg-gold-light disabled:opacity-60"
            >
              {saving ? "Saving..." : form.id ? "Save changes" : "Create focus"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
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
