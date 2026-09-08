import type { Metadata } from "next";
import rawConfig from "@/config/sabitx-tap.json";
import CopyField from "./copy-field";
import Disclosure from "./disclosure";
import QrPanel from "./qr-panel";
import ReportPanel from "./report-panel";
import styles from "./tap.module.css";

export const metadata: Metadata = {
  title: "Guest Wi-Fi | SABIT'S MART",
  description: "Free guest Wi-Fi and store information.",
  robots: { index: false, follow: false },
};

type TapConfig = {
  status: string;
  store: { name: string; locationLabel: string; standId: string };
  network: {
    ssid: string;
    password: string;
    security: string;
    hidden: boolean;
  };
  promo: {
    enabled: boolean;
    demo: boolean;
    eyebrow: string;
    title: string;
    body: string;
    detail: string | null;
  };
  actions: {
    storeInfo: {
      address: string | null;
      hours: string | null;
      phone: string | null;
      mapsUrl: string | null;
    };
    googleReviewUrl: string | null;
    feedback: { mode: string; to: string | null };
    report: { mode: string; to: string | null; categories: string[] };
  };
  links: { site: { label: string; href: string } };
};

const tapConfig = rawConfig as TapConfig;

const SECURITY_LABEL: Record<string, string> = {
  WPA: "WPA2 / WPA3",
  WEP: "WEP (legacy)",
  nopass: "Open — no password",
};

export default function TapPage() {
  const { store, network, promo, actions, links } = tapConfig;
  const pending = tapConfig.status !== "live";
  const open = network.security === "nopass";
  const ssid = network.ssid?.trim() ?? "";
  const password = network.password?.trim() ?? "";
  const info = actions.storeInfo;
  const hasInfo = Boolean(info.address || info.hours || info.phone);

  return (
    <main className={styles.shell}>
      <header className={styles.rail}>
        <span className={styles.wordmark}>SABITX</span>
        <span>{store.standId}</span>
      </header>

      <div className={styles.stage}>
        {/* ── identity ─────────────────────────────────────── */}
        <p className={styles.mark} aria-label="SABITX">
          S<span aria-hidden="true">/</span>X
        </p>
        <h1 className={styles.store}>{store.name}</h1>
        <p className={styles.headline}>FREE GUEST WI-FI</p>
        <p className={styles.sub}>
          Open Wi-Fi for customers while you&rsquo;re here. Internet only —
          it&rsquo;s a separate network from anything in the store.
        </p>

        {pending ? (
          <p className={styles.demo}>
            NOT LIVE — network details are awaiting approval and are not yet
            configured on the router.
          </p>
        ) : null}

        {/* ── STATE 1 · credentials ─────────────────────────── */}
        <section className={styles.card} aria-labelledby="connect-h">
          <h2 id="connect-h" className={styles.cardHead}>
            CONNECT TO WI-FI
          </h2>

          {ssid ? (
            <CopyField label="NETWORK" value={ssid} />
          ) : (
            <p className={styles.pending}>NETWORK — not configured yet.</p>
          )}

          {open ? (
            <p className={styles.pending}>
              PASSWORD — none. This network is open.
            </p>
          ) : password ? (
            <CopyField label="PASSWORD" value={password} secret primary />
          ) : (
            <p className={styles.pending}>PASSWORD — not configured yet.</p>
          )}

          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNum}>01</span>
              <span>Copy the password.</span>
            </li>
            <li>
              <span className={styles.stepNum}>02</span>
              <span>
                Open Settings &rsaquo; Wi-Fi and pick{" "}
                <b>{ssid || "the guest network"}</b>.
              </span>
            </li>
            <li>
              <span className={styles.stepNum}>03</span>
              <span>Paste the password and join.</span>
            </li>
          </ol>

          <dl className={styles.meta}>
            <div>
              <dt>SECURITY</dt>
              <dd>{SECURITY_LABEL[network.security] ?? network.security}</dd>
            </div>
          </dl>

          <QrPanel />
        </section>

        {/* ── STATE 2 · help ───────────────────────────────── */}
        <Disclosure summary="Need help connecting?">
          <h3 className={styles.helpH}>iPhone</h3>
          <p className={styles.helpP}>
            Settings &rsaquo; Wi-Fi &rsaquo; tap <b>{ssid || "the network"}</b>{" "}
            &rsaquo; paste the password &rsaquo; Join.
          </p>
          <h3 className={styles.helpH}>Android</h3>
          <p className={styles.helpP}>
            Settings &rsaquo; Network &amp; internet &rsaquo; Internet &rsaquo;
            tap <b>{ssid || "the network"}</b> &rsaquo; paste the password
            &rsaquo; Connect.
          </p>
          <p className={styles.helpNote}>
            This page can&rsquo;t join the network for you — phones only allow
            that from their own settings, or from a Wi-Fi QR code scanned with
            the camera.
          </p>
        </Disclosure>

        {/* ── STATE 3 · hub ────────────────────────────────── */}
        {promo.enabled ? (
          <section className={styles.card} aria-labelledby="promo-h">
            <h2 id="promo-h" className={styles.cardHead}>
              TODAY AT {store.name}
            </h2>
            {promo.demo ? (
              <p className={styles.demoInline}>
                DEMO — no real offer is running
              </p>
            ) : null}
            <p className={styles.promoEyebrow}>{promo.eyebrow}</p>
            <p className={styles.promoTitle}>{promo.title}</p>
            <p className={styles.promoBody}>{promo.body}</p>
            {promo.detail ? (
              <p className={styles.promoDetail}>{promo.detail}</p>
            ) : null}
          </section>
        ) : null}

        <nav className={styles.actions} aria-label="Store actions">
          {hasInfo ? (
            <Disclosure summary="Store info" tone="quiet">
              <dl className={styles.infoList}>
                {info.address ? (
                  <div>
                    <dt>ADDRESS</dt>
                    <dd>{info.address}</dd>
                  </div>
                ) : null}
                {info.hours ? (
                  <div>
                    <dt>HOURS</dt>
                    <dd>{info.hours}</dd>
                  </div>
                ) : null}
                {info.phone ? (
                  <div>
                    <dt>PHONE</dt>
                    <dd>
                      <a href={`tel:${info.phone.replace(/[^+\d]/g, "")}`}>
                        {info.phone}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {info.mapsUrl ? (
                <a
                  className={styles.secondary}
                  href={info.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DIRECTIONS ↗
                </a>
              ) : null}
            </Disclosure>
          ) : (
            <p className={styles.actionOff}>Store info — not set up yet.</p>
          )}

          {actions.googleReviewUrl ? (
            <a
              className={styles.secondary}
              href={actions.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              LEAVE A GOOGLE REVIEW ↗
            </a>
          ) : (
            <p className={styles.actionOff}>Google review — not set up yet.</p>
          )}

          <Disclosure summary="Report an issue" tone="quiet">
            <ReportPanel
              cfg={actions.report}
              storeName={store.name}
              locationLabel={store.locationLabel}
            />
          </Disclosure>
        </nav>

        {/* ── terms ────────────────────────────────────────── */}
        <Disclosure summary="Guest Wi-Fi terms & privacy" tone="quiet">
          <p className={styles.terms}>
            This guest Wi-Fi is provided free and <b>as-is</b> — speed and
            availability aren&rsquo;t guaranteed, and the service can be limited
            or withdrawn at any time.
          </p>
          <p className={styles.terms}>
            Use it lawfully. Don&rsquo;t attack, scan, overload or otherwise
            interfere with the network or anyone on it. You&rsquo;re responsible
            for what you do on your own device.
          </p>
          <p className={styles.terms}>
            <b>Privacy.</b> Like any Wi-Fi network, the router records basic
            connection data — your device&rsquo;s network address, and when it
            connected. We don&rsquo;t inspect the content of your traffic and we
            don&rsquo;t ask for your name, email or phone number to get online.
          </p>
          <p className={styles.termsNote}>
            Using the network means you accept these terms. This page is a
            notice, not a login — nothing here grants or blocks access.
          </p>
        </Disclosure>
      </div>

      <footer className={styles.footer}>
        <a href={links.site.href}>
          {links.site.label} <span aria-hidden="true">↗</span>
        </a>
        <span>STILL TRANSMITTING.</span>
      </footer>
    </main>
  );
}
