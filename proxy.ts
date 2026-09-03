import { NextRequest, NextResponse } from "next/server";

const RUNTIME_HOST = "sabitx.run";
const RUNTIME_WWW_HOST = "www.sabitx.run";

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostname = (forwardedHost || request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase();

  if (hostname === RUNTIME_WWW_HOST) {
    const canonical = request.nextUrl.clone();
    canonical.hostname = RUNTIME_HOST;
    canonical.port = "";
    return NextResponse.redirect(canonical, 308);
  }

  if (hostname === RUNTIME_HOST && request.nextUrl.pathname === "/") {
    const runtimeUrl = request.nextUrl.clone();
    runtimeUrl.pathname = "/run";
    return NextResponse.rewrite(runtimeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
