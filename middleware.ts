import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/labs") &&
    pathname !== "/labs/login" &&
    !pathname.startsWith("/labs/login/")
  ) {
    const response = await updateSession(request);
    // Session refresh only here; page-level guards enforce access.
    return response;
  }

  if (pathname === "/labs/login") {
    return updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/labs/:path*"],
};
