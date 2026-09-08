"use client";

import Disclosure from "./disclosure";
import { WIFI_QR_SVG } from "./wifi-qr.generated";
import styles from "./tap.module.css";

/**
 * The QR is genuinely useful for a SECOND device — you cannot scan a code
 * with the same phone that is displaying it. Labelled and collapsed to match
 * that reality rather than presented as the primary path.
 */
export default function QrPanel() {
  return (
    <Disclosure summary="Show QR for another device">
      <div className={styles.qrWrap}>
        <div
          className={styles.qr}
          role="img"
          aria-label="Wi-Fi QR code for the guest network"
          dangerouslySetInnerHTML={{ __html: WIFI_QR_SVG }}
        />
        <p className={styles.qrNote}>
          Point another phone&rsquo;s camera at this. Your own phone can&rsquo;t
          scan its own screen &mdash; use the password above instead, or the
          printed code on the back of the stand.
        </p>
      </div>
    </Disclosure>
  );
}
