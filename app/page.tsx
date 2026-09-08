import Link from "next/link";
import RuntimeStatus from "./components/RuntimeStatus";
import ImmersiveScene from "./components/ImmersiveScene";
import styles from "./home.module.css";

const tools = [
  {
    number: "01",
    name: "Build something.",
    label: "Coding workspace",
    description:
      "Turn a focused change into a tested proposal. Review the work before approving a result branch.",
    href: "/run",
    action: "Start a coding job",
    symbol: "↗",
  },
  {
    number: "02",
    name: "Find the next move.",
    label: "Planning",
    description:
      "Give an objective some structure. Work through requirements, constraints, and a practical sequence.",
    href: "/ask",
    action: "Create a plan",
    symbol: "↳",
  },
  {
    number: "03",
    name: "Keep it together.",
    label: "Private vault",
    description:
      "Open shared documents and records with the passcode for your folder.",
    href: "/vault",
    action: "Open the vault",
    symbol: "⊞",
  },
  {
    number: "04",
    name: "Pick up the thread.",
    label: "Run history",
    description:
      "Revisit saved coding jobs, review results, and return to earlier plans from this browser.",
    href: "/runs",
    action: "View recent runs",
    symbol: "↺",
  },
];

export default function Home() {
  return (
    <main className={styles.home}>
      <a className={styles.skip} href="#workspace">
        Skip to workspace
      </a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="SABITX home">
          <span className={styles.mark} aria-hidden="true">
            ×
          </span>
          SABITX<span className={styles.brandNote}>Systems in motion</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#workspace">Workspace</a>
          <Link href="/vault">Vault</Link>
          <Link href="/runs">History</Link>
        </nav>
        <Link href="/run" className={styles.headerAction}>
          Open RUN <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span /> THE SABITX WORKSPACE
          </p>
          <h1 id="hero-title">
            Intent.
            <br />
            <span>Into action.</span>
          </h1>
          <p className={styles.intro}>
            A place to think clearly, build deliberately,
            <br className={styles.desktopBreak} /> and keep the work moving.
          </p>
          <div className={styles.actions}>
            <Link href="/run" className={styles.primary}>
              Start a coding job <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/ask" className={styles.textAction}>
              Start with a plan <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className={styles.heroNote}>
            Your objective. A clear proposal. Your approval.
          </p>
        </div>
        <ImmersiveScene />
      </section>

      <div className={styles.systemBar}>
        <RuntimeStatus />
        <span>Built for deliberate work.</span>
        <a href="https://sabitinc.com">
          Part of SABIT INC <span aria-hidden="true">↗</span>
        </a>
      </div>

      <section
        id="workspace"
        className={styles.workspace}
        aria-labelledby="workspace-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>FOUR WAYS IN</p>
            <h2 id="workspace-title">What’s the next move?</h2>
          </div>
          <p>
            Choose the work.
            <br />
            Everything starts here.
          </p>
        </div>
        <div className={styles.tools}>
          {tools.map((tool) => (
            <Link key={tool.number} href={tool.href} className={styles.tool}>
              <div className={styles.toolTop}>
                <span>
                  {tool.number} / {tool.label}
                </span>
                <span className={styles.toolSymbol} aria-hidden="true">
                  {tool.symbol}
                </span>
              </div>
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
              <span className={styles.toolAction}>
                {tool.action}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.company}>
        <div>
          <p className={styles.eyebrow}>SYSTEMS MEET OPERATIONS</p>
          <h2>
            There’s a business
            <br />
            behind the build.
          </h2>
        </div>
        <div>
          <p>
            SABIT INC connects technology, retail, infrastructure, and
            operations. SABITX is where the systems work takes shape.
          </p>
          <a href="https://sabitinc.com" className={styles.textAction}>
            Explore SABIT INC <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <footer className={styles.footer}>
        <Link href="/" className={styles.brand}>
          SABITX
          <span className={styles.footerMark} aria-hidden="true">
            ×
          </span>
        </Link>
        <span>Systems in motion.</span>
        <a href="https://sabitinc.com/contact">
          Get in touch <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </main>
  );
}
