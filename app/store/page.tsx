export default function StoreLanding() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
        SABITX Store
      </h1>
      <p className="text-zinc-400 text-sm mb-8 text-center max-w-xl">
        Precision pieces. Operator-grade gear. Built for signal carriers.
      </p>

      <a
        href="https://store.sabitx.com"
        className="px-8 py-3 bg-cyan-400 text-black rounded-full font-semibold tracking-wide hover:bg-cyan-300 transition"
      >
        ENTER STORE
      </a>
    </main>
  );
}
