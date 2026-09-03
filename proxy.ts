import { NextRequest, NextResponse } from "next/server";

const RUNTIME_HOST = "sabitx.run";
const RUNTIME_WWW_HOST = "www.sabitx.run";

function rewriteTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostname = (forwardedHost || request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase();
  const { pathname } = request.nextUrl;

  // Bridge Vercel's request-scoped OIDC token into the agent pipeline.
  if (pathname === "/api/agent") {
    return rewriteTo(request, "/api/runtime/agent");
  }

  if (pathname === "/api/status") {
    return rewriteTo(request, "/api/runtime/status");
  }

  if (hostname === RUNTIME_WWW_HOST) {
    const canonical = request.nextUrl.clone();
    canonical.hostname = RUNTIME_HOST;
    canonical.port = "";
    return NextResponse.redirect(canonical, 308);
  }

  if (hostname === RUNTIME_HOST && pathname === "/") {
    return rewriteTo(request, "/run");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
