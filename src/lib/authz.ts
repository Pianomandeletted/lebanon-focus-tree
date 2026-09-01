import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Every admin API route calls this first. Because it re-derives the role
// from the server-issued session (never from a request body/header the
// client controls), there is no way to reach ADMIN by editing the frontend.
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return null;
  }
  return session;
}
