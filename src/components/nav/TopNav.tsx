"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const LINKS = [
  { href: "/tree", label: "Focus Tree" },
  { href: "/government", label: "Government" },
  { href: "/politics", label: "Politics" },
  { href: "/military", label: "Military" },
  { href: "/diplomacy", label: "Diplomacy" },
  { href: "/economy", label: "Economy" },
  { href: "/statistics", label: "Statistics" },
  { href: "/history", label: "History" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" }
];

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-cedar-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 md:px-6">
        <Link href="/tree" className="flex items-center gap-2 font-display text-lg tracking-tight text-ink-100">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-flag-red shadow-glow" />
          Republic of Lebanon
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-cedar-800 text-gold-light" : "text-ink-300 hover:bg-cedar-800/60 hover:text-ink-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-white/10 px-3 py-2 text-sm text-ink-300 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          Menu
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/5 px-4 py-3 lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-ink-300 hover:bg-cedar-800/60 hover:text-ink-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
