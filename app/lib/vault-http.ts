import { NextResponse } from "next/server";
import { VaultError } from "./vault-policy";

export const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
export function vaultJson(value: unknown, status=200) {
  return NextResponse.json(value, { status, headers: PRIVATE_HEADERS });
}
export function vaultFailure(error: unknown) {
  if (error instanceof VaultError) return vaultJson({ error: error.message }, error.status);
  // Do not log queries, connection strings, file contents, codes or tokens.
  console.error("sabitx_vault_request_failed");
  return vaultJson({ error: "Private storage is unavailable. Refresh before retrying a write." }, 503);
}
export function vaultCookie(request: Request) {
  const secure = process.env.NODE_ENV === "production" || new URL(request.url).protocol === "https:";
  return { name: secure ? "__Host-sabitx-vault" : "sabitx-vault-local", secure, httpOnly: true, sameSite: "strict" as const, path: "/" };
}
export async function boundedBody(request: Request, maximum: number): Promise<Uint8Array> {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length>maximum) throw new VaultError("Request too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new VaultError("Request body required.");
  const chunks: Uint8Array[] = []; let total=0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total+=value.length;
      if (total>maximum) { await reader.cancel(); throw new VaultError("Request too large.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(total); let offset=0;
  for (const chunk of chunks) { result.set(chunk,offset); offset+=chunk.length; }
  return result;
}
export async function vaultBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new VaultError("JSON required.",415);
  const bytes=await boundedBody(request,4096);
  try {
    const body: unknown=JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body!=="object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch { throw new VaultError("Invalid JSON request."); }
}
