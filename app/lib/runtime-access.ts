import { createHash, timingSafeEqual } from "node:crypto";

// RUN is currently a single-owner application. Rotation must not change job ownership.
export const RUN_OWNER = "sabitx-owner";

export function hasRunAccess(request: Request): boolean {
  const configured = process.env.SABITX_RUN_KEY_SHA256?.trim().toLowerCase();
  if (!configured || !/^[a-f0-9]{64}$/.test(configured)) return false;
  const authorization = request.headers.get("authorization") || "";
  const key = (request.headers.get("x-sabitx-key") ||
    (authorization.startsWith("Bearer ") ? authorization.slice(7) : "")).trim();
  if (!key || key.length > 1024) return false;
  return timingSafeEqual(createHash("sha256").update(key).digest(), Buffer.from(configured, "hex"));
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
