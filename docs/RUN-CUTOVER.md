# RUN entry and shared-file launch

## Surfaces

- `/access`: native tap/click/keyboard entry to Ask, Operator and Vault. Opening this interface never grants authentication.
- `/ask`, `/operator`, `/run`, `/runs`: preserve the existing planning and approval-gated coding application.
- `/vault`: redeem a shared link plus its folder passcode. Lists and downloads only that scope.
- `/vault/manage`: existing owner clearance; initialize new Vault tables, create folders, upload small files, create expiring grants and revoke grants.

The entry uses a typographic SABITX mark until the owner supplies a portrait/silhouette. It is not a generated likeness. A supplied image can be added under `public/sabitx/` and selected with the server-only `SABITX_PRESENCE_IMAGE` setting, e.g. `/sabitx/presence.webp`. Do not invent or reuse an unidentified person's portrait.

## Domain cutover: still requires authenticated control-plane access

Keep Cloudflare as registrar and authoritative DNS. No transfer, purchase or nameserver change is needed.

The canonical code and deploy target for this release remain `sabixdid/sabitx-core` / Vercel `sabitx-core`. Do not point the domain at the old `sabitx-run` placeholder project.

In an already authenticated local Vercel CLI session:

```sh
npx vercel domains add sabitx.run sabitx-core --scope sabih-saleems-projects-8bcd6637
npx vercel domains inspect sabitx.run --scope sabih-saleems-projects-8bcd6637
```

Use the exact DNS records requested by that inspection, not copied generic defaults. In the authenticated Cloudflare `sabitx.run` zone, inspect existing apex A/AAAA/CNAME and CAA records first. Preserve MX, TXT, DKIM, DMARC, SPF, unrelated subdomains and nameservers. Keep the intended web record DNS-only for initial verification. Stop for approval rather than deleting conflicting records or forcibly reassigning a domain from another project.

Once apex verification and TLS succeed, optionally add `www.sabitx.run` to the same Vercel project, inspect its required DNS and verify its HTTPS redirect to the apex. The application's `proxy.ts` routes apex `/` to `/access`, and redirects `www` to apex HTTPS. `sabitx.com/` is not rewritten.

Acceptance: verify externally that `sabitx.run/` serves the entry, its channels open, `/api/status` is reachable, and `/api/vault/admin`, `/api/vault/session` and `/api/vault/files/<id>` deny unauthenticated data access. Complete an owner-authorized test upload and grant test before claiming the private-drive workflow is verified. A status configuration response is not a live model, database or background-worker health test.

## Private-drive activation

No extra vendor or storage credential is introduced. The small-file launch uses the existing `DATABASE_URL` and fail-closed `SABITX_RUN_KEY_SHA256` owner verification. No source-code owner password fallback is provided.

In `/vault/manage`, authenticate and explicitly click **Initialize Vault**. This additive transaction creates only the `sabitx_vault_*` tables. It does not run during a public page request or a build, and it does not modify coding-job tables. No project attachments or personal records are imported automatically.

Launch limits: 3 MB per file, 50 files / 50 MB per folder; PDF, PNG, JPEG, WebP and UTF-8 text. Files stay behind server routes in private database storage, not in a public directory or Git repository. This is a small-file MVP, not large-archive/object storage, malware scanning or end-to-end encryption. Downloads only; previews and agent access to document contents are not implemented in this release.

Each server-generated passcode has 96 bits of randomness and is salted/scrypt-hashed. Its plaintext is shown once to the owner. Guests receive an opaque, hashed-at-rest session in an HttpOnly, Secure, SameSite=Strict host-only cookie. The session expires after at most one hour, never later than its grant. Every guest listing and download rechecks folder binding, expiry and revocation. A folder grant includes files added to that folder later. It cannot authorize operator/coding endpoints. Revoking a grant invalidates its sessions on subsequent reads; already downloaded copies cannot be recalled.

Redemption is database-rate-limited to 10 attempts per grant and 100 total per 15 minutes. Codes are never put in URLs or browser storage. Share links and codes are not sent automatically. Audit events store resource IDs, not file contents, passcodes or credentials.

## Verification and remaining gates

Run `npm test` and `npm run build`. Local policy tests cover code hashing, malformed input, opaque tokens, session lifetime, filenames and bounded file types; source assertions check the query's scope predicates. They do not substitute for database integration tests.

Before marking the drive fully verified: create two owner test folders, upload one harmless small text file to each, issue one grant, confirm it cannot download the other folder's file, revoke it and confirm both listing and downloads fail. Confirm neither guest cookies nor folder passcodes authorize coding APIs. Use only disposable test fixtures and owner-approved actions.

Claude handoff: perform the bounded domain cutover above using the owner's authenticated local tools; never print tokens, bypass a permission gate or describe queued work as completed. Preserve the current coding-job implementation and this release's server-side file authorization. Do not mark the silhouette, domain, private-drive activation or an independent 24/7 agent complete without specific evidence for each.
