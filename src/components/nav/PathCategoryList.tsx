import Link from "next/link";
import { db } from "@/lib/db";

export async function PathCategoryList({ category }: { category: "faction" | "diplomacy" | "national" }) {
  const paths = await db.path.findMany({
    where: { category, isPublished: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { focuses: true } } }
  });

  if (!paths.length) {
    return <p className="mx-auto max-w-5xl px-4 text-ink-500 md:px-6">No paths in this category yet.</p>;
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 px-4 pb-16 md:grid-cols-2 md:px-6">
      {paths.map((p) => (
        <Link
          key={p.id}
          href={`/tree?path=${p.slug}`}
          className="group rounded-lg border border-white/10 bg-cedar-900/60 p-4 transition hover:border-white/20"
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <h3 className="font-display text-base text-ink-100 group-hover:text-gold-light">{p.name}</h3>
          </div>
          <p className="text-sm text-ink-300">{p.description}</p>
          <p className="mt-2 text-xs text-ink-500">{p._count.focuses} focuses</p>
        </Link>
      ))}
    </div>
  );
}
