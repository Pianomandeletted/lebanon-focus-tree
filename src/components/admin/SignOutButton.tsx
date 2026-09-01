"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-ink-300 hover:text-ink-100"
    >
      Sign out
    </button>
  );
}
