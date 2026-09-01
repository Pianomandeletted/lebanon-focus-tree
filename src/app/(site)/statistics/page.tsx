import { PageHeader } from "@/components/nav/PageHeader";
import { db } from "@/lib/db";

function formatValue(value: number, unit: string) {
  if (unit === "$") return `$${value.toLocaleString()}`;
  return value.toLocaleString();
}

export default async function StatisticsPage() {
  const stats = await db.statistic.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader title="National Statistics" subtitle="Live figures for Lebanon, editable by the administrator." />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-16 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.id} className="rounded-lg border border-white/10 bg-cedar-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">{s.label}</p>
            <p className="mt-1 font-display text-2xl text-ink-100">{formatValue(s.value, s.unit)}</p>
            {s.maxValue != null && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-cedar-800">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${Math.min(100, (s.value / s.maxValue) * 100)}%` }}
                />
              </div>
            )}
            {s.description && <p className="mt-2 text-xs text-ink-500">{s.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
