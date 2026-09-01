"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="national-gradient flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border border-white/10 bg-cedar-950/90 p-6 shadow-node">
        <h1 className="mb-1 font-display text-xl text-ink-100">Administrator sign in</h1>
        <p className="mb-6 text-sm text-ink-500">Restricted to the Roblox Lebanon project administrator.</p>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-ink-300">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-cedar-900 px-3 py-2 text-ink-100 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-ink-300">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-cedar-900 px-3 py-2 text-ink-100 focus:border-gold focus:outline-none"
          />
        </label>

        {error && <p className="mb-4 text-sm text-status-impossible">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gold px-3 py-2 text-sm font-medium text-cedar-950 transition hover:bg-gold-light disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
