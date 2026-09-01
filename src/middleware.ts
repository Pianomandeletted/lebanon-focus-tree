import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protects every /admin page (except /admin/login) at the edge, before
// any page code runs. A logged-out or non-admin visitor is redirected
// server-side - this is not a client-side route guard that could be
// bypassed by disabling JS.
export default withAuth(
  function middleware(req) {
    const role = (req.nextauth?.token as { role?: string } | null)?.role;
    if (role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  },
  {
    callbacks: {
      authorized: () => true // let the middleware function above decide + redirect
    },
    pages: { signIn: "/admin/login" }
  }
);

export const config = {
  matcher: ["/admin/((?!login).*)"]
};
