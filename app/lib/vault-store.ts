import { neon } from "@neondatabase/serverless";
import { randomBytes, randomUUID } from "node:crypto";
import { RUN_OWNER } from "./runtime-access";
import { createPasscode, hashPasscode, verifyPasscode, requireId, requireLabel, tokenDigest, sessionSeconds, safeFileType, MAX_VAULT_FOLDER_BYTES, VaultError } from "./vault-policy";
import type { VaultAdminState, VaultAccess, VaultFile, VaultFolder, VaultGrant } from "./vault-types";

function database() {
  if (!process.env.DATABASE_URL) throw new VaultError("Private storage is not configured.", 503);
  return neon(process.env.DATABASE_URL);
}

// Additive, owner-triggered setup. No existing tables or files are changed.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS sabitx_vault_folders (id uuid PRIMARY KEY, owner_id text NOT NULL, name text NOT NULL, total_bytes integer NOT NULL DEFAULT 0, file_count integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS sabitx_vault_files (id uuid PRIMARY KEY, folder_id uuid NOT NULL REFERENCES sabitx_vault_folders(id), name text NOT NULL, mime text NOT NULL, size integer NOT NULL CHECK (size BETWEEN 1 AND 3145728), content_base64 text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS sabitx_vault_grants (id uuid PRIMARY KEY, folder_id uuid NOT NULL REFERENCES sabitx_vault_folders(id), code_hash text NOT NULL, expires_at timestamptz NOT NULL, revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS sabitx_vault_sessions (token_hash text PRIMARY KEY, grant_id uuid NOT NULL REFERENCES sabitx_vault_grants(id), expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS sabitx_vault_limits (bucket text PRIMARY KEY, reset_at timestamptz NOT NULL, count integer NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sabitx_vault_events (id uuid PRIMARY KEY, owner_id text NOT NULL, event text NOT NULL, resource_id uuid, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS sabitx_vault_files_folder_idx ON sabitx_vault_files(folder_id)`,
  `CREATE INDEX IF NOT EXISTS sabitx_vault_grants_folder_idx ON sabitx_vault_grants(folder_id)`,
];

async function audit(event: string, resource: string | null) {
  const sql = database();
  await sql`INSERT INTO sabitx_vault_events (id,owner_id,event,resource_id) VALUES (${randomUUID()}::uuid,${RUN_OWNER},${event},${resource}::uuid)`;
}

export async function initializeVault() {
  const sql = database();
  await sql.transaction(SCHEMA.map(statement => sql.query(statement, [])));
  await audit("vault_initialized", null);
}

export async function readVaultAdmin(folderId?: string): Promise<VaultAdminState> {
  const sql = database();
  const ready = await sql`SELECT to_regclass('public.sabitx_vault_folders') AS present`;
  if (!ready[0]?.present) return { setupRequired: true, folders: [], files: [], grants: [] };
  const folders = await sql`SELECT id,name,total_bytes,file_count FROM sabitx_vault_folders WHERE owner_id=${RUN_OWNER} ORDER BY created_at DESC LIMIT 100`;
  if (!folderId) return { setupRequired: false, folders: folders as VaultFolder[], files: [], grants: [] };
  const id = requireId(folderId);
  const files = await sql`SELECT f.id,f.name,f.mime,f.size,f.created_at FROM sabitx_vault_files f JOIN sabitx_vault_folders d ON d.id=f.folder_id WHERE d.id=${id}::uuid AND d.owner_id=${RUN_OWNER} ORDER BY f.created_at DESC`;
  const grants = await sql`SELECT g.id,g.expires_at,g.revoked_at,g.created_at FROM sabitx_vault_grants g JOIN sabitx_vault_folders d ON d.id=g.folder_id WHERE d.id=${id}::uuid AND d.owner_id=${RUN_OWNER} ORDER BY g.created_at DESC LIMIT 100`;
  return { setupRequired: false, folders: folders as VaultFolder[], files: files as VaultFile[], grants: grants as VaultGrant[] };
}

export async function createVaultFolder(name: unknown) {
  const sql = database(), id = randomUUID(), label = requireLabel(name);
  await sql`INSERT INTO sabitx_vault_folders (id,owner_id,name) VALUES (${id}::uuid,${RUN_OWNER},${label})`;
  await audit("folder_created", id);
  return { id, name: label };
}

export async function uploadVaultFile(folderId: unknown, rawName: unknown, bytes: Uint8Array) {
  const folder = requireId(folderId), name = requireLabel(rawName), mime = safeFileType(name, bytes);
  const sql = database(), id = randomUUID(), base64 = Buffer.from(bytes).toString("base64");
  // Reserve quota and insert in one SQL statement: concurrent uploads cannot exceed the folder quota.
  const rows = await sql`WITH reserved AS (
    UPDATE sabitx_vault_folders SET total_bytes=total_bytes+${bytes.length},file_count=file_count+1
    WHERE id=${folder}::uuid AND owner_id=${RUN_OWNER} AND file_count<50 AND total_bytes+${bytes.length}<=${MAX_VAULT_FOLDER_BYTES}
    RETURNING id)
    INSERT INTO sabitx_vault_files (id,folder_id,name,mime,size,content_base64)
    SELECT ${id}::uuid,id,${name},${mime},${bytes.length},${base64} FROM reserved RETURNING id`;
  if (!rows.length) throw new VaultError("Folder unavailable or quota reached (50 files / 50 MB).", 409);
  await audit("file_uploaded", id);
  return { id, name, mime, size: bytes.length };
}

export async function createVaultGrant(folderId: unknown, hours: unknown) {
  const folder = requireId(folderId);
  if (typeof hours !== "number" || !Number.isInteger(hours) || hours<1 || hours>168) throw new VaultError("Choose an expiry between 1 and 168 hours.");
  const sql = database(), id = randomUUID(), code = createPasscode();
  const encoded = await hashPasscode(code), expiresAt = new Date(Date.now()+hours*3600000).toISOString();
  const rows = await sql`INSERT INTO sabitx_vault_grants (id,folder_id,code_hash,expires_at)
    SELECT ${id}::uuid,id,${encoded},${expiresAt}::timestamptz FROM sabitx_vault_folders WHERE id=${folder}::uuid AND owner_id=${RUN_OWNER} RETURNING id`;
  if (!rows.length) throw new VaultError("Folder unavailable.", 404);
  await audit("grant_created", id);
  return { id, passcode: code, expiresAt, path: `/vault?share=${id}` };
}

export async function revokeVaultGrant(grantId: unknown) {
  const sql = database(), id = requireId(grantId);
  const rows = await sql`UPDATE sabitx_vault_grants g SET revoked_at=COALESCE(revoked_at,now())
    FROM sabitx_vault_folders d WHERE g.id=${id}::uuid AND d.id=g.folder_id AND d.owner_id=${RUN_OWNER} RETURNING g.id`;
  if (!rows.length) throw new VaultError("Share unavailable.", 404);
  await audit("grant_revoked", id);
}

async function consumeLimit(bucket: string, maximum: number) {
  const sql = database();
  const rows = await sql`INSERT INTO sabitx_vault_limits (bucket,reset_at,count) VALUES (${bucket},now()+interval '15 minutes',1)
    ON CONFLICT (bucket) DO UPDATE SET
      count=CASE WHEN sabitx_vault_limits.reset_at<=now() THEN 1 ELSE sabitx_vault_limits.count+1 END,
      reset_at=CASE WHEN sabitx_vault_limits.reset_at<=now() THEN now()+interval '15 minutes' ELSE sabitx_vault_limits.reset_at END
    WHERE sabitx_vault_limits.count<${maximum} OR sabitx_vault_limits.reset_at<=now() RETURNING count`;
  if (!rows.length) throw new VaultError("Too many access attempts. Retry in 15 minutes.", 429);
}

export async function redeemVaultGrant(grantId: unknown, code: unknown) {
  const id = requireId(grantId), sql = database();
  await consumeLimit("all-redemptions", 100);
  const rows = await sql`SELECT g.code_hash,g.expires_at FROM sabitx_vault_grants g JOIN sabitx_vault_folders d ON d.id=g.folder_id
    WHERE g.id=${id}::uuid AND d.owner_id=${RUN_OWNER} AND g.revoked_at IS NULL AND g.expires_at>now()`;
  if (!rows.length) throw new VaultError("Passcode or shared link unavailable.", 401);
  await consumeLimit(`grant:${id}`, 10);
  if (!(await verifyPasscode(code, rows[0].code_hash))) throw new VaultError("Passcode or shared link unavailable.", 401);
  const token = randomBytes(32).toString("base64url"), digest = tokenDigest(token)!;
  // Recheck revocation after the expensive password hash and bind the session only to this grant.
  const saved = await sql`INSERT INTO sabitx_vault_sessions (token_hash,grant_id,expires_at)
    SELECT ${digest},id,LEAST(expires_at,now()+interval '1 hour') FROM sabitx_vault_grants
    WHERE id=${id}::uuid AND revoked_at IS NULL AND expires_at>now() RETURNING expires_at`;
  if (!saved.length) throw new VaultError("Passcode or shared link unavailable.", 401);
  await audit("access_granted", id);
  return { token, maxAge: sessionSeconds(saved[0].expires_at) };
}

export async function readVaultAccess(token: unknown): Promise<VaultAccess> {
  const digest = tokenDigest(token);
  if (!digest) throw new VaultError("A valid shared-drive session is required.", 401);
  const sql = database();
  const scopes = await sql`SELECT d.name,g.expires_at FROM sabitx_vault_sessions s
    JOIN sabitx_vault_grants g ON g.id=s.grant_id JOIN sabitx_vault_folders d ON d.id=g.folder_id
    WHERE s.token_hash=${digest} AND d.owner_id=${RUN_OWNER} AND s.expires_at>now() AND g.expires_at>now() AND g.revoked_at IS NULL`;
  if (!scopes.length) throw new VaultError("Access expired or was revoked.", 401);
  const files = await sql`SELECT f.id,f.name,f.mime,f.size,f.created_at FROM sabitx_vault_sessions s
    JOIN sabitx_vault_grants g ON g.id=s.grant_id JOIN sabitx_vault_files f ON f.folder_id=g.folder_id JOIN sabitx_vault_folders d ON d.id=f.folder_id
    WHERE s.token_hash=${digest} AND d.owner_id=${RUN_OWNER} AND s.expires_at>now() AND g.expires_at>now() AND g.revoked_at IS NULL ORDER BY f.created_at DESC`;
  return { folderName: scopes[0].name, expiresAt: scopes[0].expires_at, files: files as VaultFile[] };
}

export async function downloadVaultFile(fileId: unknown, token: unknown, owner: boolean) {
  const id = requireId(fileId), sql = database();
  const digest = tokenDigest(token);
  if (!owner && !digest) throw new VaultError("Clearance required.", 401);
  const rows = owner
    ? await sql`SELECT f.name,f.mime,f.content_base64 FROM sabitx_vault_files f JOIN sabitx_vault_folders d ON d.id=f.folder_id WHERE f.id=${id}::uuid AND d.owner_id=${RUN_OWNER}`
    : await sql`SELECT f.name,f.mime,f.content_base64 FROM sabitx_vault_sessions s
      JOIN sabitx_vault_grants g ON g.id=s.grant_id JOIN sabitx_vault_files f ON f.folder_id=g.folder_id JOIN sabitx_vault_folders d ON d.id=f.folder_id
      WHERE f.id=${id}::uuid AND s.token_hash=${digest} AND d.owner_id=${RUN_OWNER} AND s.expires_at>now() AND g.expires_at>now() AND g.revoked_at IS NULL`;
  if (!rows.length) throw new VaultError("File unavailable in this clearance scope.", 404);
  await audit(owner ? "owner_download" : "guest_download", id);
  return { name: rows[0].name as string, mime: rows[0].mime as string, bytes: new Uint8Array(Buffer.from(rows[0].content_base64, "base64")) };
}

export async function closeVaultSession(token: unknown) {
  const digest = tokenDigest(token);
  if (digest) { const sql = database(); await sql`DELETE FROM sabitx_vault_sessions WHERE token_hash=${digest}`; }
}
