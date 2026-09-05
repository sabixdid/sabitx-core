import { AsyncLocalStorage } from "node:async_hooks";

type VercelRequestContext = { headers?: Record<string, string> };
const REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
type RuntimeGlobal = typeof globalThis & {
  [REQUEST_CONTEXT_SYMBOL]?: { get?: () => VercelRequestContext };
};
const credentials = new AsyncLocalStorage<string>();

export function getRequestScopedVercelOidcToken() {
  return (globalThis as RuntimeGlobal)[REQUEST_CONTEXT_SYMBOL]?.get?.().headers?.["x-vercel-oidc-token"] || "";
}

export function getGatewayCredential() {
  return process.env.AI_GATEWAY_API_KEY || credentials.getStore() ||
    getRequestScopedVercelOidcToken() || process.env.VERCEL_OIDC_TOKEN || "";
}

export function gatewayCredentialsAvailable() { return Boolean(getGatewayCredential()); }

// Request-local credentials never overwrite process environment or block other jobs.
export async function withVercelGatewayCredentials<T>(operation: () => Promise<T>): Promise<T> {
  const token = getGatewayCredential();
  if (!token) throw new Error("Gateway credentials are unavailable for this request.");
  return credentials.run(token, operation);
}
