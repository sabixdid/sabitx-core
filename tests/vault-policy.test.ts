import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createPasscode, hashPasscode, verifyPasscode, tokenDigest, sessionSeconds, requireId, requireLabel, safeFileType, MAX_VAULT_FILE_BYTES } from "../app/lib/vault-policy";

test("passcodes have independent salts and verify only the correct code", async () => {
  const code = createPasscode();
  const a = await hashPasscode(code), b = await hashPasscode(code);
  assert.notEqual(a, b);
  assert.equal(await verifyPasscode(code, a), true);
  assert.equal(await verifyPasscode(code.toLowerCase().replaceAll("-", " "), a), true);
  assert.equal(await verifyPasscode(createPasscode(), a), false);
  assert.equal(a.includes(code), false);
});
test("malformed codes and hash records fail closed", async () => {
  assert.equal(await verifyPasscode("1234", ""), false);
  assert.equal(await verifyPasscode(createPasscode(), "scrypt:bad:bad"), false);
  assert.equal(await verifyPasscode(null, ""), false);
  await assert.rejects(hashPasscode("1234"));
});
test("sessions are high-entropy opaque references, never plaintext database keys", () => {
  const token = randomBytes(32).toString("base64url");
  assert.equal(tokenDigest(token)?.length, 64);
  assert.notEqual(tokenDigest(token), token);
  assert.equal(tokenDigest("master-key"), null);
});
test("session expiry never outlives a grant or an hour", () => {
  const now = Date.now();
  assert.equal(sessionSeconds(new Date(now + 7200000), now), 3600);
  assert.equal(sessionSeconds(new Date(now + 45000), now), 45);
  assert.equal(sessionSeconds(new Date(now - 1), now), 0);
  assert.equal(sessionSeconds("not a date", now), 0);
});
test("identifiers, paths and header injection are rejected", () => {
  assert.throws(() => requireId("../../etc/passwd"));
  assert.throws(() => requireLabel("a\r\nContent-Type: text/html"));
  assert.throws(() => requireLabel("../secret.pdf"));
  assert.equal(requireLabel("  Client documents  "), "Client documents");
});
test("downloads only accept content-matched, bounded passive file types", () => {
  assert.equal(safeFileType("record.pdf", Buffer.from("%PDF-1.7 test")), "application/pdf");
  assert.equal(safeFileType("note.txt", Buffer.from("Hello")), "text/plain; charset=utf-8");
  assert.throws(() => safeFileType("record.pdf", Buffer.from("<html>")));
  assert.throws(() => safeFileType("script.svg", Buffer.from("<svg/>")));
  assert.throws(() => safeFileType("note.txt", Buffer.from([255])));
  assert.throws(() => safeFileType("large.txt", new Uint8Array(MAX_VAULT_FILE_BYTES + 1)));
});
test("guest SQL is bound to its grant, folder, expiry and revocation", () => {
  const source = readFileSync("app/lib/vault-store.ts", "utf8");
  assert.match(source, /f\.folder_id=g\.folder_id/);
  assert.match(source, /g\.revoked_at IS NULL/);
  assert.match(source, /s\.expires_at>now\(\)/);
  assert.match(source, /g\.expires_at>now\(\)/);
});
