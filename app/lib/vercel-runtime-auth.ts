type VercelRequestContext = {
  headers?: Record<string, string>;
};

const REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");

type RuntimeGlobal = typeof globalThis & {
  [REQUEST_CONTEXT_SYMBOL]?: { get?: () => VercelRequestContext };
  __sabitxGatewayAuthQueue?: Promise<void>;
};

const runtimeGlobal = globalThis as RuntimeGlobal;

export function getRequestScopedVercelOidcToken() {
  return (
    runtimeGlobal[REQUEST_CONTEXT_SYMBOL]?.get?.().headers?.[
      "x-vercel-oidc-token"
    ] || ""
  );
}

export function gatewayCredentialsAvailable() {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      getRequestScopedVercelOidcToken() ||
      process.env.VERCEL_OIDC_TOKEN
  );
}

/**
 * The existing agent client reads VERCEL_OIDC_TOKEN from process.env. Vercel
 * supplies its short-lived token in request context, so this bridge exposes it
 * only for the duration of one serialized gateway operation, then restores the
 * previous process state.
 */
export async function withVercelGatewayCredentials<T>(
  operation: () => Promise<T>
): Promise<T> {
  if (process.env.AI_GATEWAY_API_KEY) {
    return operation();
  }

  const requestToken = getRequestScopedVercelOidcToken();
  const fallbackToken = process.env.VERCEL_OIDC_TOKEN || "";
  const token = requestToken || fallbackToken;

  if (!token) {
    throw new Error(
      "Vercel did not provide an OIDC token for this runtime request."
    );
  }

  let releaseLock: () => void = () => undefined;
  const previousLock = runtimeGlobal.__sabitxGatewayAuthQueue ?? Promise.resolve();
  const currentLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  runtimeGlobal.__sabitxGatewayAuthQueue = previousLock.then(() => currentLock);

  await previousLock;

  const previousToken = process.env.VERCEL_OIDC_TOKEN;
  process.env.VERCEL_OIDC_TOKEN = token;

  try {
    return await operation();
  } finally {
    if (previousToken) {
      process.env.VERCEL_OIDC_TOKEN = previousToken;
    } else {
      delete process.env.VERCEL_OIDC_TOKEN;
    }
    releaseLock();
  }
}
