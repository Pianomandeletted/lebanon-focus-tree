import { PageHeader } from "@/components/nav/PageHeader";
import { db } from "@/lib/db";

export default async function MilitaryPage() {
  const paths = await db.path.findMany({
    where: {
      isPublished: true,
      OR: [
        { slug: { in: ["laf", "military_dev", "laf_dev", "sla", "cedar_guardians"] } }
      ]
    },
    orderBy: { order: "asc" },
    include: { _count: { select: { focuses: true } } }
  });

  return (
    <div>
      <PageHeader
        title="Military"
        subtitle="The Lebanese Armed Forces, allied militias, and national military-development branches."
      />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 px-4 pb-16 md:grid-cols-2 md:px-6">
        {paths.map((p) => (
          <a
            key={p.id}
            href={`/tree?path=${p.slug}`}
            className="rounded-lg border border-white/10 bg-cedar-900/60 p-4 hover:border-white/20"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <h3 className="font-display text-base text-ink-100">{p.name}</h3>
            </div>
            <p className="text-sm text-ink-300">{p.description}</p>
            <p className="mt-2 text-xs text-ink-500">{p._count.focuses} focuses</p>
          </a>
        ))}
      </div>
    </div>
  );
}
