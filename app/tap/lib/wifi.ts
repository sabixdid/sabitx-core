/**
 * WIFI: URI scheme used by iOS/Android camera apps to offer a network join.
 * Only these five characters are backslash-escaped by the scheme; the
 * backslash itself must be replaced first or the others double-escape.
 */
export function escapeWifiValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/([;,:"])/g, "\\$1");
}

export type WifiNetwork = {
  ssid: string;
  password: string;
  security: string;
  hidden?: boolean;
};

export function wifiPayload({
  ssid,
  password,
  security,
  hidden = false,
}: WifiNetwork): string {
  const t = security === "nopass" ? "nopass" : security;
  let out = `WIFI:T:${t};S:${escapeWifiValue(ssid)};`;
  if (t !== "nopass") out += `P:${escapeWifiValue(password)};`;
  if (hidden) out += "H:true;";
  return `${out};`;
}
