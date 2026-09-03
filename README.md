# SABITX Core

SABITX is the systems layer behind SABITINC. This repository serves the public systems map at `sabitx.com` and the first authenticated execution surface for `sabitx.run`.

## Runtime architecture

```text
objective
  → architect
  → validated execution specification
  → operator
  → verification state
```

The current production pipeline uses Vercel AI Gateway with request-scoped OIDC authentication. External actions are not executed by the v1 runtime; every completed run is returned in `planned` state with approval gates preserved.

## Surfaces

- `/` — systems map and live runtime state
- `/run` — authenticated execution console
- `/ask` — command intake alias
- `/operator` — operator surface alias
- `/runs` — browser-local run register
- `/vault` — Vault surface
- `/api/status` — public, read-only runtime status endpoint
- `/api/agent` — clearance-protected architect/operator endpoint

## Runtime configuration

Production defaults:

```env
SABITX_ARCHITECT_MODEL=openai/gpt-oss-120b
SABITX_OPERATOR_MODEL=alibaba/qwen3-coder-30b-a3b
```

The intended premium pairing can be restored after paid model access or provider credentials are available:

```env
SABITX_ARCHITECT_MODEL=openai/gpt-5.6-sol
SABITX_OPERATOR_MODEL=anthropic/claude-sonnet-5
```

Set the clearance credential as a SHA-256 hash; never commit the plaintext key:

```env
SABITX_RUN_KEY_SHA256=<64-character-sha256>
```

Vercel OIDC is preferred in production. `AI_GATEWAY_API_KEY` remains an optional explicit fallback for local or non-Vercel execution.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. Local AI calls require `AI_GATEWAY_API_KEY` in `.env.local`.

## Attach `sabitx.run`

The application is already host-aware: the apex domain rewrites `/` to `/run`, while `www.sabitx.run` redirects to the apex.

1. Add `sabitx.run` and `www.sabitx.run` to the `sabitx-core` Vercel project.
2. At the external DNS provider, set the apex A record to `76.76.21.21`.
3. Set `www` as a CNAME to `cname.vercel-dns-0.com`.
4. Keep proxying disabled until Vercel verifies the records and provisions TLS.
5. Verify `https://sabitx.run`, `https://sabitx.run/api/status`, and the `www` redirect.

## Verification contract

A release is healthy when:

- the production build completes without TypeScript errors;
- `/api/status` returns `runtime: online`, `signal: active`, and `agent.state: ready`;
- `/run` renders the clearance console;
- an authorized run returns a validated architect specification and operator output;
- no route, response, or log exposes plaintext credentials;
- no external action is claimed without evidence.
