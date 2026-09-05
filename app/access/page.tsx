import type { Metadata } from "next";
import Image from "next/image";
import styles from "./access.module.css";
export const metadata: Metadata = { title: "Clearance | SABITX RUN", description: "One entry. Deliberate access. SABITX planning, approved coding and scoped files." };
export default function AccessPage() {
  const candidate=process.env.SABITX_PRESENCE_IMAGE || "";
  const portrait=/^\/sabitx\/[a-z0-9_-]+\.(webp|png|jpe?g)$/i.test(candidate) ? candidate : null;
  return <main className={styles.shell}>
    <header className={styles.rail}><a href="https://sabitx.com">SABITX</a><span>RUN / CLEARANCE LAYER</span></header>
    <section className={styles.stage}>
      <p className={styles.eyebrow}>STILL TRANSMITTING.</p>
      <h1>Presence.<br/><span>With purpose.</span></h1>
      <details className={styles.presence}>
        <summary aria-label="Open SABITX access channels">
          <span className={styles.frame}>
            {portrait ? <Image src={portrait} alt="Configured SABITX portrait" width={280} height={360} priority className={styles.portrait}/> : <span className={styles.glyph} aria-hidden="true">S<span>X</span></span>}
            <span className={styles.scan} aria-hidden="true"/>
          </span>
          <span className={styles.tap}>TAP TO ENTER <span aria-hidden="true">↗</span></span>
        </summary>
        <nav className={styles.channels} aria-label="Choose an access channel">
          <a href="/ask"><small>01 / OWNER CLEARANCE</small><strong>ASK <span>↗</span></strong><p>Turn an objective into a structured plan.</p></a>
          <a href="/operator"><small>02 / APPROVAL GATED</small><strong>OPERATOR <span>↗</span></strong><p>Propose, build, review, then approve code changes.</p></a>
          <a href="/vault"><small>03 / FOLDER PASSCODE</small><strong>VAULT <span>↗</span></strong><p>Open only the files your shared link permits.</p></a>
        </nav>
      </details>
      <p className={styles.note}>Opening this entry does not grant access.<br/>Each channel verifies its own clearance.</p>
    </section>
    <footer className={styles.footer}><a href="/runs">RUN REGISTER</a><a href="https://sabitinc.com">PUBLIC OPERATIONS</a><span>INTENT → ACTION → EVIDENCE</span></footer>
  </main>;
}
