import Link from "next/link";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-12 md:px-6">
      <p className="mb-2 text-xs text-ink-500">
        <Link href="/tree" className="hover:text-gold-light">
          ← Back to Focus Tree
        </Link>
      </p>
      <h1 className="font-display text-3xl text-ink-100 md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-ink-300">{subtitle}</p>}
    </div>
  );
}
