# SABITX Core

SABITX is the systems layer behind SABITINC. This Next.js application serves the public systems map and the clearance-protected RUN console at `https://sabitx.com/run`.

## Approved coding jobs

1. Enter an objective and select one to four interface or documentation files.
2. The architect and operator propose exact file changes against the repository's current default-branch revision.
3. An isolated Vercel Sandbox installs the existing lockfile and runs a production build, including TypeScript checks.
4. Review the saved diff and build output. Only your explicit approval allows a repository write.
5. The server creates a separate branch and verifies its commit and file contents against the saved proposal. Merging or deploying that result is a separate action.

The initial adapter is fixed to `sabixdid/sabitx-core`. It permits regular `.ts`, `.tsx`, `.css` and `.md` files in the interface and documentation areas. API routes, server libraries, the approval component, dependencies, secrets, CI and infrastructure are protected. Files are limited to 50 KB each and 100 KB total. Five preparation requests are allowed per ten minutes.

Job records, proposals, approval timestamps, build output and result links are stored privately in Neon Postgres. Both listing and individual access require the owner clearance key. This is a single-owner console, not a multi-user authorization system. Browser storage holds only the current session's clearance key and earlier planning runs.

## Architecture

- `app/lib/coding-policy.ts`: fixed repository, file scope, size limits and cryptographic proposal binding.
- `app/lib/coding-service.ts`: preparation, approval and result verification.
- `app/lib/coding-store.ts`: private job storage, distributed preparation limit and atomic approval claim.
- `app/lib/coding-github.ts`: repository-scoped Vercel Connect tokens and create-only result branches.
- `app/lib/coding-sandbox.ts`: credential-free checkout and build with restricted outbound network access.
- `app/lib/runtime-access.ts`: shared, fail-closed owner clearance verification.
- `app/lib/vercel-runtime-auth.ts`: request-local AI Gateway credentials; no global token mutation.

The sandbox receives no project environment variables or production credentials. Dependency install scripts are disabled. During the build only the existing Google Fonts hosts are reachable. A successful build is evidence of compilation, not a guarantee of functional correctness.

## Surfaces

- `/`: public systems map
- `/run`, `/ask`, `/operator`: coding console and existing planning mode
- `/runs`: private saved coding jobs plus earlier browser-local plans
- `/vault`: existing Vault surface
- `/api/status`, `/api/runtime/status`: public configuration summary, not a live dependency health test
- `/api/agent`, `/api/runtime/agent`: existing clearance-protected planning API
- `/api/coding/jobs`: authenticated list and preparation
- `/api/coding/jobs/[id]`: authenticated detail, approval or cancellation

## Configuration and local development

Link the existing Vercel project and pull its development environment securely into the ignored `.env.local`. Required configuration:

- `SABITX_RUN_KEY_SHA256`: SHA-256 hash of the owner clearance key. There is no source-code fallback.
- `DATABASE_URL`: the linked Neon database.
- Vercel project OIDC: AI Gateway, Sandbox and the installed GitHub connector.
- `SABITX_GITHUB_CONNECTOR`: optional connector UID; defaults to `github/sabitx-run`.

Current default models are `openai/gpt-oss-120b` and `alibaba/qwen3-coder-30b-a3b`. The `SABITX_ARCHITECT_MODEL` and `SABITX_OPERATOR_MODEL` environment variables override them. `AI_GATEWAY_API_KEY` is an optional Gateway fallback, but does not replace project credentials for GitHub or Sandbox.

```sh
npm ci
npm run db:migrate
npm test
npm run build
npm run dev
```

The migration creates only this feature's tables and is safe to rerun. Never commit `.env` files, tokens or plaintext clearance keys. `npm run test:storage` is an explicit live integration check: it creates and deletes its own uniquely identified fixture and verifies the database approval lock.

## Interrupted jobs and limits

Preparation runs within a bounded server request and the sandbox expires automatically. Records survive a lost browser connection, but this release does not include an automatic background queue or retry worker. Load saved jobs before starting a replacement after an interrupted request. An execution checkpoint records the expected commit before branch creation; an ambiguous branch response is read back, never blindly repeated. A failed or interrupted execution requires inspecting its recorded branch before retrying work.

Private-repository checkout, general shell tasks, automatic pull requests, merges, deployments, account integrations and multi-user access are future capabilities. Existing calling and messaging routes are preserved and are outside this coding adapter.

## Release verification

Run policy/access tests, TypeScript and production build checks, and browser checks for `/`, `/run` and `/runs`. Exercise a real bounded documentation job through preparation, approval and GitHub readback; verify unauthenticated access is denied and duplicate approval does not create another result. A status label alone is not execution evidence.

`sabitx.run` is a separate domain cutover. Host-aware routing already exists, but domain attachment, DNS and TLS must be independently verified before advertising that address.
