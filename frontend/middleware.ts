import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/upload", "/dashboard", "/query", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("nyaya_token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/upload/:path*", "/dashboard/:path*", "/query/:path*", "/admin/:path*"],
};
