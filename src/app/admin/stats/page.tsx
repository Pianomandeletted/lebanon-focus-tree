"use client";

import { useEffect, useState } from "react";

type Stat = {
  id: string;
  key: string;
  label: string;
  value: number;
  maxValue: number | null;
  unit: string;
  description: string;
  order: number;
};

const EMPTY = { id: "", key: "", label: "", value: 0, maxValue: "" as number | "", unit: "", description: "", order: 0 };

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [form, setForm] = useState(EMPTY);

  async function refresh() {
    setStats(await (await fetch("/api/stats")).json());
  }
  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      key: form.key,
      label: form.label,
      value: Number(form.value),
      maxValue: form.maxValue === "" ? null : Number(form.maxValue),
      unit: form.unit,
      description: form.description,
      order: Number(form.order)
    };
    await fetch(form.id ? `/api/stats/${form.id}` : "/api/stats", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setForm(EMPTY);
    refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this statistic?")) return;
    await fetch(`/api/stats/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-100">Statistics</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-cedar-900/80 text-left text-ink-500">
              <tr>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.id} className="border-t border-white/5 hover:bg-cedar-900/40">
                  <td className="px-3 py-2 text-ink-100">{s.label}</td>
                  <td className="px-3 py-2 text-ink-300">
                    {s.value}
                    {s.maxValue != null ? ` / ${s.maxValue}` : ""} {s.unit}
                  </td>
                  <td className="space-x-2 px-3 py-2 text-right">
                    <button
                      onClick={() =>
                        setForm({
                          id: s.id,
                          key: s.key,
                          label: s.label,
                          value: s.value,
                          maxValue: s.maxValue ?? "",
                          unit: s.unit,
                          description: s.description,
                          order: s.order
                        })
                      }
                      className="text-gold-light hover:underline"
                    >
                      Edit
                    </button>
                    <button onClick={() => onDelete(s.id)} className="text-status-impossible hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-lg border border-white/10 bg-cedar-900/60 p-4">
          <h2 className="font-display text-lg text-ink-100">{form.id ? "Edit statistic" : "New statistic"}</h2>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Key (unique, e.g. gdp)</span>
            <input
              required
              disabled={!!form.id}
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100 disabled:opacity-50"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Label</span>
            <input
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-ink-300">Value</span>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-300">Max (for progress bar)</span>
              <input
                type="number"
                value={form.maxValue}
                onChange={(e) => setForm({ ...form, maxValue: e.target.value === "" ? "" : Number(e.target.value) })}
                className="w-full rounded-md border border-white/10 bg-cedar-950 px-3 py-2 text-ink-100"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-300">Unit (e.g. $)</span>
            <input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
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
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 rounded-md bg-gold px-3 py-2 text-sm font-medium text-cedar-950 hover:bg-gold-light">
              {form.id ? "Save changes" : "Create statistic"}
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
