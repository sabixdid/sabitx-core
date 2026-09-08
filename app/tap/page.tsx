import type { Metadata } from "next";
import tapConfig from "@/config/sabitx-tap.json";
import CopyField from "./copy-field";
import styles from "./tap.module.css";

export const metadata: Metadata = {
  title: "ACCESS | SABITX",
  description: "Guest network access.",
  robots: { index: false, follow: false },
};

const SECURITY_LABEL: Record<string, string> = {
  WPA: "WPA2 / WPA3",
  WEP: "WEP (legacy)",
  nopass: "Open — no password",
};

export default function TapPage() {
  const { network, links, stand } = tapConfig;
  const isDemo = tapConfig.status === "demo";
  const open = network.security === "nopass";
  const ssid = network.ssid?.trim();
  const password = network.password?.trim();
  const hasSsid = Boolean(ssid);
  const hasPassword = open || Boolean(password);

  return (
    <main className={styles.shell}>
      <header className={styles.rail}>
        <span className={styles.wordmark}>SABITX</span>
        <span>{stand.id}</span>
      </header>

      <section className={styles.stage}>
        <p className={styles.mark} aria-label="SABITX">
          S<span aria-hidden="true">/</span>X
        </p>
        <h1 className={styles.title}>ACCESS</h1>
        <p className={styles.sub}>{network.label}</p>

        {isDemo ? (
          <p className={styles.demo}>
            DEMO VALUES — not a real network. Replace{" "}
            <code>config/sabitx-tap.json</code> before publishing.
          </p>
        ) : null}

        <div className={styles.card}>
          <p className={styles.cardHead}>GUEST WI-FI</p>

          {hasSsid ? (
            <CopyField label="NETWORK" value={ssid} />
          ) : (
            <p className={styles.pending}>NETWORK — not configured yet.</p>
          )}

          {open ? (
            <p className={styles.pending}>
              PASSWORD — none. This network is open.
            </p>
          ) : hasPassword ? (
            <CopyField label="PASSWORD" value={password} secret />
          ) : (
            <p className={styles.pending}>PASSWORD — not configured yet.</p>
          )}

          <dl className={styles.meta}>
            <div>
              <dt>SECURITY</dt>
              <dd>{SECURITY_LABEL[network.security] ?? network.security}</dd>
            </div>
            {network.hidden ? (
              <div>
                <dt>SSID</dt>
                <dd>Hidden — add the network manually</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <ol className={styles.steps}>
          <li>
            <span className={styles.stepNum}>01</span>
            <span>Copy the password above.</span>
          </li>
          <li>
            <span className={styles.stepNum}>02</span>
            <span>
              Open Wi-Fi settings and choose{" "}
              <b>{hasSsid ? ssid : "the guest network"}</b>.
            </span>
          </li>
          <li>
            <span className={styles.stepNum}>03</span>
            <span>Paste the password and join.</span>
          </li>
        </ol>
        <p className={styles.note}>
          Faster: scan the QR on the back of the stand with your camera and
          confirm the join prompt. No copying needed.
        </p>
      </section>

      <footer className={styles.footer}>
        <a href={links.site.href}>
          {links.site.label} <span aria-hidden="true">↗</span>
        </a>
        <span>STILL TRANSMITTING.</span>
      </footer>
    </main>
  );
}
