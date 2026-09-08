import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { escapeWifiValue, wifiPayload } from "../app/tap/lib/wifi";
import { WIFI_QR_PAYLOAD } from "../app/tap/wifi-qr.generated";

const tapConfig = JSON.parse(
  readFileSync(new URL("../config/sabitx-tap.json", import.meta.url), "utf8"),
);

test("escapes exactly the five WIFI: scheme characters, backslash first", () => {
  // plain input -> each reserved char gains one backslash
  assert.equal(escapeWifiValue('a;b,c:d"e'), String.raw`a\;b\,c\:d\"e`);
  // a literal backslash is doubled BEFORE the others, never double-escaped
  assert.equal(escapeWifiValue(String.raw`a\;b`), String.raw`a\\\;b`);
  // apostrophes and spaces are NOT reserved and must pass through untouched
  assert.equal(escapeWifiValue("SABIT'S MART GUEST"), "SABIT'S MART GUEST");
});

test("builds a well-formed WPA payload", () => {
  assert.equal(
    wifiPayload({ ssid: "NET", password: "pw", security: "WPA" }),
    "WIFI:T:WPA;S:NET;P:pw;;",
  );
});

test("omits the password for an open network", () => {
  const out = wifiPayload({ ssid: "NET", password: "x", security: "nopass" });
  assert.equal(out, "WIFI:T:nopass;S:NET;;");
  assert.ok(!out.includes("P:"));
});

test("marks hidden networks", () => {
  assert.match(
    wifiPayload({ ssid: "N", password: "p", security: "WPA", hidden: true }),
    /H:true;/,
  );
});

// The printed QR is static. If the config changes and the QR is not
// regenerated, the sign on the counter silently stops working.
test("committed QR matches the current guest network config", () => {
  assert.equal(
    WIFI_QR_PAYLOAD,
    wifiPayload(tapConfig.network),
    "config/sabitx-tap.json changed without running scripts/generate-wifi-qr.mjs",
  );
});

test("guest password avoids characters that break QR joins or misread in print", () => {
  const pw = tapConfig.network.password;
  assert.ok(!/[\;,:"]/.test(pw), "password needs WIFI: escaping");
  assert.ok(!/[0O1lI]/.test(pw), "password contains ambiguous glyphs");
  assert.ok(pw.length >= 12, "password too short");
});

test("SSID is within the 32-byte 802.11 limit", () => {
  assert.ok(Buffer.byteLength(tapConfig.network.ssid, "utf8") <= 32);
});
