#!/usr/bin/env node
/**
 * Regenerates app/tap/wifi-qr.generated.ts from config/sabitx-tap.json.
 * Run after changing the guest network. tests/tap-wifi.test.ts fails the
 * build if the committed QR and the config have drifted apart.
 */
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const root = path.resolve(import.meta.dirname, "..");
const cfg = JSON.parse(
  fs.readFileSync(path.join(root, "config/sabitx-tap.json"), "utf8"),
);

const esc = (v) =>
  String(v)
    .replace(/\\/g, "\\\\")
    .replace(/([;,:"])/g, "\\$1");
const { ssid, password, security, hidden } = cfg.network;
const t = security === "nopass" ? "nopass" : security;
let payload = `WIFI:T:${t};S:${esc(ssid)};`;
if (t !== "nopass") payload += `P:${esc(password)};`;
if (hidden) payload += "H:true;";
payload += ";";

const svg = await QRCode.toString(payload, {
  type: "svg",
  errorCorrectionLevel: "Q",
  margin: 1,
  color: { dark: "#000000", light: "#FFFFFF" },
});

const out = `// GENERATED FILE — do not edit by hand.
// Run \`node scripts/generate-wifi-qr.mjs\` after changing config/sabitx-tap.json.
export const WIFI_QR_PAYLOAD = ${JSON.stringify(payload)};
export const WIFI_QR_SVG = ${JSON.stringify(svg)};
`;
fs.writeFileSync(path.join(root, "app/tap/wifi-qr.generated.ts"), out);
console.log("wrote app/tap/wifi-qr.generated.ts");
console.log("payload:", payload);
