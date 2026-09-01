import Link from "next/link";
import { AuthSessionProvider } from "@/components/admin/AuthSessionProvider";
import { SignOutButton } from "@/components/admin/SignOutButton";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/focuses", label: "Focuses" },
  { href: "/admin/paths", label: "Paths" },
  { href: "/admin/stats", label: "Statistics" },
  { href: "/admin/music", label: "Music" },
  { href: "/admin/announcements", label: "Announcements" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <div className="min-h-screen bg-cedar-950">
        <header className="border-b border-white/10 bg-cedar-900/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <nav className="flex flex-wrap items-center gap-1">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-md px-3 py-1.5 text-sm text-ink-300 hover:bg-cedar-800 hover:text-ink-100">
                  {l.label}
                </Link>
              ))}
              <Link href="/tree" className="rounded-md px-3 py-1.5 text-sm text-gold-light hover:bg-cedar-800">
                View site →
              </Link>
            </nav>
            <SignOutButton />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </AuthSessionProvider>
  );
}
