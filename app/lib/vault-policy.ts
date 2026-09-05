import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
export const MAX_VAULT_FILE_BYTES = 3 * 1024 * 1024;
export const MAX_VAULT_FOLDER_BYTES = 50 * 1024 * 1024;
export const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export class VaultError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

export function requireId(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) throw new VaultError("Invalid reference.");
  return value.toLowerCase();
}

export function requireLabel(value: unknown): string {
  if (typeof value !== "string") throw new VaultError("A name is required.");
  const name = value.normalize("NFKC").trim();
  if (!name || name.length > 160 || /[\x00-\x1f\x7f/\\]/.test(name) || name === "." || name === "..") {
    throw new VaultError("Use a name of 1–160 characters without path separators or control characters.");
  }
  return name;
}

export function createPasscode(): string {
  return randomBytes(12).toString("hex").toUpperCase().match(/.{4}/g)!.join("-");
}

export function normalizePasscode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase();
}

export async function hashPasscode(code: string): Promise<string> {
  const normalized = normalizePasscode(code);
  if (!/^[A-F0-9]{24}$/.test(normalized)) throw new VaultError("Invalid passcode format.");
  const salt = randomBytes(16).toString("hex");
  const key = await derive(normalized, salt, 32) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPasscode(code: unknown, encoded: string): Promise<boolean> {
  if (typeof code !== "string" || code.length > 128) return false;
  const normalized = normalizePasscode(code);
  if (!/^[A-F0-9]{24}$/.test(normalized)) return false;
  const parts = encoded.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt" || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const key = await derive(normalized, parts[1], 32) as Buffer;
  return timingSafeEqual(key, Buffer.from(parts[2], "hex"));
}

export function tokenDigest(token: unknown): string | null {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return createHash("sha256").update(token).digest("hex");
}

export function sessionSeconds(expiresAt: string | Date, now = Date.now()): number {
  const seconds = Math.floor((new Date(expiresAt).getTime() - now) / 1000);
  return Number.isFinite(seconds) ? Math.max(0, Math.min(3600, seconds)) : 0;
}

export function safeFileType(name: string, bytes: Uint8Array): string {
  requireLabel(name);
  if (!bytes.length || bytes.length > MAX_VAULT_FILE_BYTES) throw new VaultError("Files must be nonempty and no larger than 3 MB.", 413);
  const data = Buffer.from(bytes);
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "pdf" && data.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  if (extension === "png" && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  if (["jpg", "jpeg"].includes(extension || "") && data[0] === 255 && data[1] === 216 && data[2] === 255) return "image/jpeg";
  if (extension === "webp" && data.subarray(0,4).toString() === "RIFF" && data.subarray(8,12).toString() === "WEBP") return "image/webp";
  if (["txt", "md", "csv", "json"].includes(extension || "") && !data.includes(0)) {
    try { new TextDecoder("utf-8", { fatal: true }).decode(data); return "text/plain; charset=utf-8"; } catch { /* Reject binary content. */ }
  }
  throw new VaultError("Supported files: PDF, PNG, JPEG, WebP and UTF-8 text. Content must match the extension.");
}
